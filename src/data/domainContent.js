// This file acts like a simple lookup table for your domain explanations.
// The top-level keys are your exam codes (e.g., A1101, A1102, Network+).
// Each exam code has an object of domainNumber: "content" pairs.

export const domainContent = {
  'A+1101': {
    "1.1": "Content for 1.1...",
    "1.2": "Content for 1.2...",
  },
  'A+1102': {  // Make sure this key exactly matches what's being passed
    "1.1": `
    🖥️ Windows 10 Editions

• Home
  Designed for basic users; lacks advanced management features.

• Pro
  Adds features like BitLocker, Remote Desktop, and Group Policy management.

• Pro for Workstations
  Optimized for high-end hardware, supports ReFS, and more RAM.

• Enterprise
  Tailored for large organizations; adds AppLocker, Windows To Go, and advanced security features.

⚙️ Feature Differences

• Domain access vs. workgroup
  ○ Domain: Used in businesses; centralized control via Active Directory.
  ○ Workgroup: Used in home networks; each computer manages its own settings.

• Desktop styles/user interface
  ○ Higher editions (like Enterprise) may offer more UI customization or additional Start Menu/Taskbar features.

• Remote Desktop Protocol (RDP)
  ○ Host capability is only in Pro and above. Home edition can only connect to RDP, not host.

• RAM support limitations
  ○ Home editions support less RAM (e.g., 128 GB), while Enterprise and Pro for Workstations can support 2 TB+.

      
      
      
      `,
    "1.2": "A1102 domain 1.2 explanation..."
  },
  'NetworkPlus': {
    "1.1": "Network+ domain 1.1 explanation...",
    "1.2": "Network+ domain 1.2 explanation..."
  }
  
