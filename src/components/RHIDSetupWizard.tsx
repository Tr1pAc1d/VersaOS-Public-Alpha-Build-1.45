import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface RHIDSetupWizardProps {
  vfs: any;
  onComplete: () => void;
  onCancel: () => void;
  onReboot: () => void;
}

const INSTALL_FILES = [
  "vmlinuz-2.0.36", "initrd.img", "libc.so.5", "ld-linux.so.2", "bash",
  "sh", "login", "getty", "init", "mount", "umount", "fsck", "mkfs",
  "fdisk", "ifconfig", "route", "ping", "traceroute", "telnet", "ftp",
  "ls", "cp", "mv", "rm", "mkdir", "rmdir", "cat", "more", "less",
  "grep", "sed", "awk", "find", "tar", "gzip", "bzip2", "make", "gcc",
  "ld", "as", "ar", "nm", "strip", "man", "info", "vi", "emacs",
  "passwd", "useradd", "userdel", "groupadd", "chmod", "chown", "chgrp",
  "ps", "top", "kill", "nice", "renice", "cron", "at", "ssh", "scp",
  "libpthread.so.0", "libdl.so.2", "libm.so.6", "libcrypt.so.1",
  "libnss_files.so.2", "libpam.so.0", "libutil.so.1", "libresolv.so.2",
  "kernel/drivers/net/ne2000.o", "kernel/drivers/block/ide-disk.o",
  "kernel/drivers/char/serial.o", "kernel/fs/ext2/ext2.o",
  "kernel/fs/vfat/vfat.o", "kernel/net/ipv4/tcp.o",
  "etc/inittab", "etc/fstab", "etc/passwd", "etc/shadow", "etc/group",
  "etc/hosts", "etc/resolv.conf", "etc/sysconfig/network",
  "usr/share/man/man1/ls.1.gz", "usr/share/man/man1/cat.1.gz",
  "usr/share/terminfo/v/vt100", "usr/share/zoneinfo/UTC",
  "var/log/messages", "var/log/secure", "var/spool/cron/root"
];

const INSTALL_MESSAGES = [
  "Extracting kernel modules...",
  "Installing shared libraries...",
  "Configuring network subsystem...",
  "Writing POSIX shell environment...",
  "Installing manual pages...",
  "Registering system services...",
  "Updating kernel symbol table...",
  "Building module dependencies...",
  "Configuring terminal emulator...",
  "Linking dynamic libraries...",
  "Installing RHID subsystem drivers...",
  "Patching Vespera kernel interface...",
  "Finalizing RHID integration..."
];

const LICENSE_TEXT = `RHID SUBSYSTEM FOR VESPERA OS
END-USER LICENSE AGREEMENT
Version 4.03.22.1

Copyright (C) 1994-1996 Red Hat Software, Inc.
Portions Copyright (C) 1991-1996 Vespera Systems Corporation.
All Rights Reserved.

IMPORTANT — READ CAREFULLY: This End-User License Agreement ("EULA") is a legal agreement between you (either an individual or a single entity) and Vespera Systems Corporation ("Vespera") for the RHID Subsystem software product identified above, which includes computer software and may include associated media, printed materials, and online or electronic documentation ("SOFTWARE PRODUCT").

By installing, copying, or otherwise using the SOFTWARE PRODUCT, you agree to be bound by the terms of this EULA. If you do not agree to the terms of this EULA, do not install or use the SOFTWARE PRODUCT.

1. GRANT OF LICENSE
This EULA grants you the following rights:
- Installation and Use. You may install and use one copy of the SOFTWARE PRODUCT on a single computer running Vespera OS 1.0.4 or later.
- The SOFTWARE PRODUCT is based on Red Hat Linux 3.0.3, modified and redistributed under the terms of the GNU General Public License (GPL) v2.

2. GNU GENERAL PUBLIC LICENSE
The Linux kernel and associated GNU utilities included in this SOFTWARE PRODUCT are distributed under the GNU General Public License, Version 2, June 1991. You may obtain a copy of the GPL at http://www.gnu.org/licenses/gpl-2.0.html.

This means you are free to redistribute and modify the covered components, provided you comply with the terms of the GPL. The source code for GPL-covered components is available upon written request to Vespera Systems.

3. RED HAT TRADEMARK NOTICE
Red Hat is a registered trademark of Red Hat Software, Inc. The RHID distribution is an independently modified derivative and is not affiliated with, endorsed by, or supported by Red Hat Software, Inc. Use of Red Hat trademarks is for identification purposes only and does not imply any affiliation or endorsement.

4. DESCRIPTION OF OTHER RIGHTS AND LIMITATIONS
- You may not reverse engineer, decompile, or disassemble the proprietary Vespera integration layer of the SOFTWARE PRODUCT.
- You may not rent, lease, or lend the SOFTWARE PRODUCT.
- Vespera Systems reserves the right to update, modify, or discontinue the SOFTWARE PRODUCT at any time.

5. TERMINATION
Without prejudice to any other rights, Vespera may terminate this EULA if you fail to comply with the terms and conditions. In such event, you must destroy all copies of the SOFTWARE PRODUCT.

6. NO WARRANTIES
THE SOFTWARE PRODUCT IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. NEITHER VESPERA SYSTEMS NOR RED HAT SOFTWARE SHALL BE LIABLE FOR ANY DAMAGES WHATSOEVER ARISING OUT OF THE USE OF OR INABILITY TO USE THIS SOFTWARE PRODUCT.

7. GOVERNING LAW
This EULA shall be governed by the laws of the State of California, United States of America.

Red Hat Software, Inc.
P.O. Box 4325
Chapel Hill, NC 27515
USA

Vespera Systems Corporation
1 Innovation Drive
Silicon Valley, CA 94025
USA`;

/** Simple red diamond SVG icon for RHID branding */
const RHIDIcon: React.FC<{ size?: number }> = ({ size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Diamond shape */}
    <polygon points="32,4 60,32 32,60 4,32" fill="#CC0000" stroke="#8B0000" strokeWidth="2" />
    {/* Inner diamond highlight */}
    <polygon points="32,12 52,32 32,52 12,32" fill="#E60000" opacity="0.6" />
    {/* Terminal cursor icon */}
    <text x="32" y="38" textAnchor="middle" fill="white" fontSize="18" fontFamily="monospace" fontWeight="bold">&gt;_</text>
  </svg>
);

export { RHIDIcon };

export const RHIDSetupWizard: React.FC<RHIDSetupWizardProps> = ({ vfs, onComplete, onCancel, onReboot }) => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState("");
  const [currentMessage, setCurrentMessage] = useState("");
  const [installLogs, setInstallLogs] = useState<string[]>([]);
  const [acceptLicense, setAcceptLicense] = useState(false);
  const [restartNow, setRestartNow] = useState(true);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  const handleFinish = () => {
    vfs.installApp(
      'RHID_TERMINAL.EXE',
      'RHID Terminal v4.03.22.1',
      '4.03.22.1',
      'rhid_exe',
      true,
      'terminal'
    );

    if (restartNow) {
      // Delay reboot to allow VFS state to persist to localStorage
      setTimeout(() => onReboot(), 300);
    } else {
      onComplete();
    }
  };

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [installLogs]);

  useEffect(() => {
    if (step === 3) {
      const totalDuration = 35000;
      const updateInterval = 100;
      const totalSteps = totalDuration / updateInterval;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        const newProgress = (currentStep / totalSteps) * 100;
        setProgress(newProgress);

        if (Math.random() > 0.45) {
          const file = INSTALL_FILES[Math.floor(Math.random() * INSTALL_FILES.length)];
          setCurrentFile(file);
          setInstallLogs(prev => {
            const newLogs = [...prev, `Installing: C:\\VESPERA\\SYSTEM\\RHID\\${file}`];
            return newLogs.slice(-25);
          });
        }

        if (Math.random() > 0.93) {
          setCurrentMessage(INSTALL_MESSAGES[Math.floor(Math.random() * INSTALL_MESSAGES.length)]);
        }

        if (newProgress >= 100) {
          clearInterval(interval);
          setCurrentFile("Done.");
          setCurrentMessage("Installation complete.");
          setInstallLogs(prev => [
            ...prev,
            "Registering RHID subsystem with Vespera kernel...",
            "Updating system configuration...",
            "RHID Terminal v4.03.22.1 installed successfully."
          ]);
          setTimeout(() => setStep(4), 1200);
        }
      }, updateInterval);

      return () => clearInterval(interval);
    }
  }, [step]);

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-black font-sans text-sm">
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar — Red themed */}
        <div className="w-1/3 flex flex-col items-center justify-center p-4 text-white shrink-0" style={{ backgroundColor: '#8B0000' }}>
          <RHIDIcon size={72} />
          <h2 className="text-xl font-bold text-center mt-3">RHID<br/>Setup</h2>
          <p className="text-[10px] mt-2 opacity-70 text-center">v4.03.22.1</p>
        </div>

        {/* Right Content */}
        <div className="w-2/3 p-6 flex flex-col overflow-y-auto">
          {step === 0 && (
            <>
              <h3 className="font-bold text-lg mb-4">Welcome to RHID Subsystem Setup</h3>
              <p className="mb-3">This wizard will install <strong>RHID Terminal v4.03.22.1</strong> — a Kernel & Linux Subsystem Update for Vespera OS.</p>
              <p className="mb-3">RHID is based on the Red Hat Linux 3.0.3 distribution, providing a fully POSIX-compliant shell environment and GNU utilities directly within Vespera OS.</p>
              <p className="mb-3">It is recommended that you close all other applications before starting Setup. <strong>A system restart will be required</strong> after installation to complete kernel integration.</p>
              <p className="mb-3 text-xs text-gray-600">This software contains components licensed under the GNU General Public License (GPL) v2.</p>
              <p>Click Next to continue.</p>
            </>
          )}

          {step === 1 && (
            <>
              <h3 className="font-bold text-lg mb-3">License Agreement</h3>
              <p className="mb-2 text-xs">Please read the following license agreement carefully. You must accept the terms of this agreement before continuing with the installation.</p>
              <div className="flex-1 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2 overflow-y-auto text-[11px] font-mono leading-relaxed whitespace-pre-wrap mb-3 min-h-[200px] max-h-[280px]">
                {LICENSE_TEXT}
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={acceptLicense}
                  onChange={e => setAcceptLicense(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-sm font-bold">I accept the terms of the License Agreement</span>
              </label>
            </>
          )}

          {step === 2 && (
            <>
              <h3 className="font-bold text-lg mb-4">Choose Install Location</h3>
              <p className="mb-4">Setup will install RHID Terminal in the following folder.</p>
              <div className="mb-4">
                <label className="block text-xs mb-1">Destination Folder</label>
                <div className="flex gap-2">
                  <input type="text" value="C:\VESPERA\SYSTEM\RHID" readOnly className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 py-1 bg-white outline-none" />
                  <button className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-4 py-1 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white disabled:opacity-50">Browse...</button>
                </div>
              </div>
              <div className="text-xs space-y-1 mb-4">
                <p>Space required: 6.2 MB</p>
                <p>Space available: 1.2 GB</p>
              </div>
              <div className="border border-gray-400 bg-white p-3 text-xs space-y-1">
                <p className="font-bold">Components to install:</p>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked disabled className="w-3 h-3" />
                  <span>RHID Kernel Modules (2.1 MB)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked disabled className="w-3 h-3" />
                  <span>GNU Core Utilities (1.8 MB)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked disabled className="w-3 h-3" />
                  <span>Bash Shell v1.14.7 (0.9 MB)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked disabled className="w-3 h-3" />
                  <span>Shared Libraries & Headers (1.2 MB)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked disabled className="w-3 h-3" />
                  <span>Manual Pages (0.2 MB)</span>
                </label>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="flex flex-col h-full">
              <h3 className="font-bold text-lg mb-2">Installing RHID Subsystem</h3>
              <p className="mb-2">Please wait while the RHID kernel and Linux subsystem is being installed.</p>

              <div className="mb-1 text-xs font-bold truncate">
                {currentMessage || "Extracting kernel modules..."}
              </div>

              <div className="mb-2 text-xs truncate text-gray-700">
                {currentFile}
              </div>

              {/* Red progress bar */}
              <div className="w-full h-6 bg-[#c0c0c0] border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-[2px] flex mb-2 shrink-0">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-full w-[4.5%] mx-[0.25%] ${i < (progress / 5) ? 'bg-[#CC0000]' : 'bg-transparent'}`}
                  />
                ))}
              </div>

              <div ref={logsContainerRef} className="flex-1 bg-black border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1 overflow-y-auto text-[10px] font-mono leading-tight text-green-500">
                {installLogs.map((log, i) => (
                  <div key={i} className="truncate">{log}</div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <>
              <h3 className="font-bold text-lg mb-4">Completing the RHID Subsystem Setup</h3>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 size={20} className="text-green-600" />
                <span className="font-bold">RHID Terminal v4.03.22.1 has been installed successfully.</span>
              </div>
              <p className="mb-4">The RHID kernel subsystem requires a system restart to complete integration with the Vespera OS kernel. Your existing applications and settings will not be affected.</p>

              <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white p-4 space-y-3">
                <p className="font-bold text-sm" style={{ color: '#8B0000' }}>⚠ A system restart is required to apply kernel changes.</p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="restart"
                    checked={restartNow}
                    onChange={() => setRestartNow(true)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-bold">Restart now</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="restart"
                    checked={!restartNow}
                    onChange={() => setRestartNow(false)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">I will restart later</span>
                </label>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="border-t-2 border-gray-400 p-4 flex justify-end gap-2 bg-[#c0c0c0] shrink-0">
        {step < 4 && (
          <button
            onClick={onCancel}
            disabled={step === 3}
            className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-6 py-1 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        {step > 0 && step < 3 && (
          <button
            onClick={() => setStep(step - 1)}
            className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-6 py-1 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
          >
            &lt; Back
          </button>
        )}
        {step === 0 && (
          <button
            onClick={() => setStep(1)}
            className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-6 py-1 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white font-bold"
          >
            Next &gt;
          </button>
        )}
        {step === 1 && (
          <button
            onClick={() => setStep(2)}
            disabled={!acceptLicense}
            className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-6 py-1 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white font-bold disabled:opacity-50"
          >
            Next &gt;
          </button>
        )}
        {step === 2 && (
          <button
            onClick={() => setStep(3)}
            className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-6 py-1 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white font-bold"
            style={{ backgroundColor: '#CC0000', color: 'white', borderTopColor: '#FF4444', borderLeftColor: '#FF4444', borderBottomColor: '#660000', borderRightColor: '#660000' }}
          >
            Install
          </button>
        )}
        {step === 4 && (
          <button
            onClick={handleFinish}
            className="border-2 px-6 py-1 font-bold"
            style={{ backgroundColor: '#CC0000', color: 'white', borderTopColor: '#FF4444', borderLeftColor: '#FF4444', borderBottomColor: '#660000', borderRightColor: '#660000' }}
          >
            Finish
          </button>
        )}
      </div>
    </div>
  );
};
