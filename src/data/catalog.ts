import { CatalogItem } from '../types';

export const CATALOG_ITEMS: CatalogItem[] = [
  {
    id: 'vmc-850',
    name: 'Ganesh Pro VMC-850 CNC Machining Center',
    category: 'Industrial Machinery',
    modelCode: 'GE-VMC-850',
    shortDesc: 'Heavy-duty 3-axis vertical machining center engineered for high-precision dies, aerospace tooling, and automotive parts.',
    specifications: {
      capacity: 'Table: 1000 x 500 mm, X/Y/Z: 850/500/550 mm',
      power: '11/15 kW Spindle Motor, 10,000 RPM',
      dimensions: '2800 x 2200 x 2600 mm (Approx 5,500 kg)',
      precision: 'Positioning: ±0.005 mm, Repeatability: ±0.003 mm',
      warranty: '2 Years Manufacturer + On-site Support',
    },
    priceRange: '₹28,50,000 – ₹34,00,000 ($34k - $41k)',
    demoAvailable: true,
    stockStatus: 'In Stock',
    highlights: [
      '24-Pocket High-Speed Tool Arm Changer',
      'Fanuc / Siemens CNC Controller Options',
      'Full Enclosure with Chip Conveyor & Flood Coolant',
      'Eligible for Ganesh On-Site Trial Demo Package',
    ],
  },
  {
    id: 'tl-600',
    name: 'Precision Heavy-Duty CNC Lathe Machine',
    category: 'Industrial Machinery',
    modelCode: 'GE-TL-600',
    shortDesc: 'Slant-bed CNC turning center built for continuous duty shaft turning, heavy threading, and high-tensile bar work.',
    specifications: {
      capacity: 'Max Swing: 600 mm, Max Turning Length: 1000 mm',
      power: '15 kW High-Torque AC Spindle, 3500 RPM',
      dimensions: '3100 x 1850 x 1900 mm',
      precision: 'Runout ≤ 0.002 mm',
      warranty: '2 Years Comprehensive',
    },
    priceRange: '₹18,00,000 – ₹22,50,000 ($22k - $27k)',
    demoAvailable: true,
    stockStatus: 'Fast Ship (3-5 days)',
    highlights: [
      'Hydraulic 3-Jaw Chuck with Foot Pedal',
      '8-Station Hydraulic Turret',
      'Hardened & Ground Slant-Bed Guideways',
    ],
  },
  {
    id: 'pb-160t',
    name: 'Electro-Hydraulic CNC Press Brake (160 Ton)',
    category: 'Fabrication & Cutting',
    modelCode: 'GE-PB-160T',
    shortDesc: 'Multi-axis synchro press brake for accurate sheet metal bending, architectural panels, and heavy enclosures.',
    specifications: {
      capacity: '160 Ton Bending Force, 3200 mm Bending Length',
      power: '11 kW Hydraulic Motor with Bosch Rexroth Valves',
      dimensions: '3600 x 1700 x 2450 mm',
      precision: 'Bending Angle Accuracy: ±0.2°',
      warranty: '3 Years Hydraulic Cylinder Guarantee',
    },
    priceRange: '₹22,00,000 – ₹26,00,000 ($26k - $31k)',
    demoAvailable: true,
    stockStatus: 'In Stock',
    highlights: [
      'Delem DA-53T Multi-Touch CNC Controller',
      'Automatic Mechanical Crowning System',
      'Euro-style Quick Clamp Tooling included',
      'Eligible for 7-Day Trial Evaluation on Worksite',
    ],
  },
  {
    id: 'fl-3015',
    name: 'Ganesh Titan 3kW / 6kW Fiber Laser Cutter',
    category: 'Fabrication & Cutting',
    modelCode: 'GE-FL-3015',
    shortDesc: 'High-speed fiber laser cutting table for mild steel (up to 25mm), stainless steel, brass, and aluminum plates.',
    specifications: {
      capacity: 'Working Area: 3000 x 1500 mm (10 x 5 ft)',
      power: 'Raycus/IPG Fiber Source 3000W / 6000W',
      dimensions: '4500 x 2250 x 1800 mm',
      precision: 'Positioning Accuracy: ±0.03 mm/m',
      warranty: '2 Years Laser Source + Lifetime Frame Guarantee',
    },
    priceRange: '₹32,00,000 – ₹48,00,000 ($38k - $58k)',
    demoAvailable: true,
    stockStatus: 'Fast Ship (3-5 days)',
    highlights: [
      'Dual Exchange Shuttle Tables for Zero Downtime',
      'Autofocus Raytools Laser Head with Anti-Collision Sensor',
      'Heavy Cast-Iron Gantry & Aviation Aluminum Beam',
    ],
  },
  {
    id: 'ac-30hp',
    name: 'Industrial Rotary Screw Air Compressor (30 HP)',
    category: 'Industrial Machinery',
    modelCode: 'GE-AC-30HP',
    shortDesc: 'Continuous-run 100% duty cycle rotary screw compressor with integrated refrigerated air dryer and storage receiver.',
    specifications: {
      capacity: '125 CFM (3.5 m³/min) @ 8-10 Bar Working Pressure',
      power: '22 kW (30 HP) IE3 High-Efficiency Electric Motor',
      dimensions: '1400 x 950 x 1350 mm',
      precision: 'Low Noise ≤ 68 dB(A)',
      warranty: '5 Years Airend Warranty',
    },
    priceRange: '₹4,50,000 – ₹5,80,000 ($5.5k - $7k)',
    demoAvailable: true,
    stockStatus: 'In Stock',
    highlights: [
      'Direct-Coupled German Design Airend',
      'Smart Microprocessor with Auto-Fault Diagnostics',
      'Ideal for Laser Cutters, CNC shops & Pneumatic Lines',
    ],
  },
  {
    id: 'mig-500',
    name: 'Industrial Heavy MIG/MAG 500A Inverter Welder',
    category: 'Fabrication & Cutting',
    modelCode: 'GE-MIG-500-HD',
    shortDesc: 'Heavy-duty 500-Amp water-cooled pulse MIG welding setup for structural fabrication, pressure vessels, and heavy boilers.',
    specifications: {
      capacity: '500A @ 60% Duty Cycle, 400A @ 100% Duty Cycle',
      power: '3-Phase 415V, 24 kVA',
      dimensions: '750 x 360 x 680 mm (Cart Mounted with Water Cooler)',
      warranty: '2 Years Machine Warranty',
    },
    priceRange: '₹1,25,000 – ₹1,65,000 ($1.5k - $2k)',
    demoAvailable: true,
    stockStatus: 'In Stock',
    highlights: [
      'Separate 4-Roll Wire Feeder with 10m Interconnection Cable',
      'Synergic Microprocessor with Preset Welding Curves',
      'Water-Cooled Binzel-Style 501D Torch Included',
    ],
  },
  {
    id: 'md-50',
    name: 'Magnetic Core Drilling Machine (50mm Depth)',
    category: 'Power Tools & Hardware',
    modelCode: 'GE-MD-50',
    shortDesc: 'Heavy-duty electromagnetic broach cutter drill for girder drilling, onsite railway, and structural steel erection.',
    specifications: {
      capacity: 'Core Drilling: 12 - 50 mm, Twist Drill: up to 23 mm',
      power: '1700W Heavy-Torque Motor, 15,000N Magnet Adhesion',
      dimensions: '320 x 210 x 480 mm (Weight: 14 kg)',
      warranty: '1 Year Industrial Warranty',
    },
    priceRange: '₹42,000 – ₹55,000 ($500 - $660)',
    demoAvailable: false,
    stockStatus: 'In Stock',
    highlights: [
      'Internal Spindle Cooling & Lubrication System',
      '2-Speed Mechanical Gearbox for optimal cutting torque',
      'Includes Carrying Case, Safety Strap & Arbor Adapter',
    ],
  },
  {
    id: 'fasteners-bearings',
    name: 'High-Tensile Grade 8.8/10.9 Fasteners & SKF/FAG Bearings',
    category: 'Spares, Bearings & Fittings',
    modelCode: 'GE-IND-PARTS',
    shortDesc: 'Wholesale supplies of industrial spherical roller bearings, deep groove ball bearings, hydraulic fittings, and high-tensile hardware.',
    specifications: {
      capacity: 'Custom bore sizes: 10mm to 350mm, Metric & Imperial',
      precision: 'ISO P5 / ABEC-5 Precision Grades',
      warranty: '100% Genuine Certified Stock',
    },
    priceRange: 'Custom Volume Pricing with Bulk Discounts',
    demoAvailable: false,
    stockStatus: 'In Stock',
    highlights: [
      'Ready inventory of Pillow Blocks, Flange Units & Seals',
      'Hydraulic Hoses & High-Pressure Quick Connectors',
      'Immediate Same-Day Dispatch for emergency maintenance',
    ],
  },
];

export const DEMO_PROGRAM_INFO = {
  title: 'Ganesh On-Site Demo & Low-Cost Trial Program',
  tagline: 'Test Equipment Performance on Your Shop Floor Before Full Purchase',
  features: [
    'Zero-Risk Machinery Evaluation: We ship a trial unit or host a live workpiece cutting/bending test.',
    'Test Your Actual Material: Bring your own sheet metal, rods, or workpieces to verify tolerances.',
    'Certified Application Engineer On-Site: Our senior technician assists in setup, programming, and cycle time calculation.',
    'Credit Toward Final Purchase: Trial demo fee is 100% credited toward machine procurement.',
  ],
  trialFee: 'Nominal deposit (credited in full upon purchase)',
  averageSetupTime: '24–48 hours upon confirmation',
};

export interface SamplePrompt {
  label: string;
  prompt: string;
  category: string;
  language: 'English' | 'Hinglish' | 'Hindi';
}

export const SAMPLE_CALLER_PROMPTS: SamplePrompt[] = [
  {
    label: 'Hinglish: Fiber Laser Quote & Demo',
    prompt: 'Adesh bhai, humare plant ke liye 6kW Fiber Laser cutter ka price aur specifications janna hai. Trial demo kaise schedule hoga?',
    category: 'Sales & Demo',
    language: 'Hinglish',
  },
  {
    label: 'Hindi: CNC लेथ मशीन और ट्रायल पैकेज',
    prompt: 'नमस्ते आदेश! हमारी वर्कशॉप के लिए भारी-भरकम CNC लेथ मशीन चाहिए। क्या आप इसका ऑन-साइट ट्रायल डेमो और कोटेशन दे सकते हैं?',
    category: 'Sales & Demo',
    language: 'Hindi',
  },
  {
    label: 'English: VMC-850 Quotation',
    prompt: 'Hi Adesh, I need a formal technical quotation for the Ganesh Pro VMC-850 CNC center with 10,000 RPM spindle for our Pune plant.',
    category: 'Quotation',
    language: 'English',
  },
  {
    label: 'Hinglish: Urgent Machine Repair',
    prompt: 'Adesh, humari hydraulic press brake machine se oil leak ho raha hai aur pressure error #401 aa raha hai. Urgent technician bhej sakte ho?',
    category: 'Service',
    language: 'Hinglish',
  },
  {
    label: 'Hindi: फास्टनर्स और बेयरिंग स्टॉक',
    prompt: 'नमस्ते, क्या आपके पास ग्रेड 10.9 हाई टेंसाइल फास्टनर्स और 22218 स्फेरिकल रोलर बेयरिंग्स तुरंत डिस्पैच के लिए उपलब्ध हैं?',
    category: 'Hardware Stock',
    language: 'Hindi',
  },
  {
    label: 'English: On-Site Trial Program Inquiry',
    prompt: 'Could you explain Ganesh Enterprises on-site demo and low-cost trial program? We want to test cutting tolerances on our workpieces before purchase.',
    category: 'Trial Demo',
    language: 'English',
  },
];
