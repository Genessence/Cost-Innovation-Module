import type { PartCode } from '../types';

/** Mock ERP master — part codes for an air-conditioner / appliance plant. */
export const PART_CODES: PartCode[] = [
  { code: 'AMB-CMP-00412', description: 'Rotary Compressor 1.5T Inverter', specification: 'R32, 4400W cooling, BLDC, 220-240V', material: 'Cast Iron / Copper windings', currentUnitCost: 6850, quarterlyVolume: 18000, category: 'Compressor' },
  { code: 'AMB-CMP-00418', description: 'Rotary Compressor 1.0T Fixed Speed', specification: 'R32, 3100W cooling, 220-240V 50Hz', material: 'Cast Iron / Copper windings', currentUnitCost: 5200, quarterlyVolume: 12500, category: 'Compressor' },
  { code: 'AMB-CMP-00425', description: 'Twin Rotary Compressor 2.0T', specification: 'R410A, 5800W cooling, inverter duty', material: 'Cast Iron / Copper windings', currentUnitCost: 8900, quarterlyVolume: 7200, category: 'Compressor' },
  { code: 'AMB-SHM-01102', description: 'Outdoor Unit Cabinet Panel', specification: '0.6mm CRCA, powder coated RAL9016', material: 'CRCA Steel', currentUnitCost: 485, quarterlyVolume: 42000, category: 'Sheet Metal' },
  { code: 'AMB-SHM-01118', description: 'IDU Chassis Base Plate', specification: '0.8mm GI sheet, deep drawn', material: 'Galvanized Iron', currentUnitCost: 312, quarterlyVolume: 45000, category: 'Sheet Metal' },
  { code: 'AMB-SHM-01131', description: 'ODU Top Cover Assembly', specification: '0.5mm CRCA, hemmed edges, epoxy coat', material: 'CRCA Steel', currentUnitCost: 268, quarterlyVolume: 42000, category: 'Sheet Metal' },
  { code: 'AMB-CTB-02201', description: 'Copper Tube 9.52mm OD Coil', specification: 'Grooved, 0.7mm wall, 15m coil, C12200', material: 'Phosphorus deoxidized copper', currentUnitCost: 1240, quarterlyVolume: 38000, category: 'Copper Tubing' },
  { code: 'AMB-CTB-02214', description: 'Copper Tube 6.35mm OD Coil', specification: 'Plain, 0.6mm wall, 15m coil, C12200', material: 'Phosphorus deoxidized copper', currentUnitCost: 890, quarterlyVolume: 41000, category: 'Copper Tubing' },
  { code: 'AMB-CTB-02230', description: 'Suction Line Assembly 12.7mm', specification: 'Brazed joints, insulated, formed', material: 'Copper / EPDM insulation', currentUnitCost: 640, quarterlyVolume: 30000, category: 'Copper Tubing' },
  { code: 'AMB-PCB-03301', description: 'Inverter Main Control PCB', specification: 'IPM 15A, 4-layer FR4, conformal coated', material: 'FR4 / SMD components', currentUnitCost: 2850, quarterlyVolume: 18000, category: 'PCB' },
  { code: 'AMB-PCB-03315', description: 'Indoor Display PCB', specification: '2-layer FR4, 7-seg LED, IR receiver', material: 'FR4 / SMD components', currentUnitCost: 420, quarterlyVolume: 44000, category: 'PCB' },
  { code: 'AMB-PCB-03322', description: 'ODU Driver PCB Fixed Speed', specification: '2-layer FR4, relay drive, 230VAC', material: 'FR4 / THT + SMD', currentUnitCost: 760, quarterlyVolume: 12500, category: 'PCB' },
  { code: 'AMB-MTR-04401', description: 'Indoor Fan Motor BLDC 30W', specification: '8-pole BLDC, 1300RPM, IP20', material: 'Silicon steel / NdFeB magnets', currentUnitCost: 1150, quarterlyVolume: 44000, category: 'Motor' },
  { code: 'AMB-MTR-04412', description: 'ODU Fan Motor 60W', specification: '6-pole induction, 850RPM, IP44', material: 'Silicon steel / Copper', currentUnitCost: 980, quarterlyVolume: 42000, category: 'Motor' },
  { code: 'AMB-MTR-04420', description: 'Stepper Motor Louvre Drive', specification: '12V, 64:1 gearbox, 5-wire', material: 'Ferrite / ABS gearbox', currentUnitCost: 145, quarterlyVolume: 46000, category: 'Motor' },
  { code: 'AMB-FST-05501', description: 'Self-Tapping Screw M4x12 ZnP', specification: 'Pan head, Phillips, zinc plated', material: 'Carbon steel', currentUnitCost: 0.85, quarterlyVolume: 2400000, category: 'Fasteners' },
  { code: 'AMB-FST-05515', description: 'Hex Flange Bolt M6x16', specification: 'Grade 8.8, zinc flake coated', material: 'Alloy steel', currentUnitCost: 2.4, quarterlyVolume: 680000, category: 'Fasteners' },
  { code: 'AMB-FST-05528', description: 'Compressor Mounting Grommet Kit', specification: 'M8 stud + rubber grommet set of 3', material: 'EPDM / Steel', currentUnitCost: 28, quarterlyVolume: 37000, category: 'Fasteners' },
  { code: 'AMB-INS-06601', description: 'Nitrile Rubber Insulation Tube 19mm', specification: 'Class O, 13mm wall, 2m length', material: 'NBR foam', currentUnitCost: 96, quarterlyVolume: 76000, category: 'Insulation' },
  { code: 'AMB-INS-06612', description: 'EPS Packaging Set IDU', specification: 'Moulded EPS 20 density, 2-piece', material: 'Expanded polystyrene', currentUnitCost: 118, quarterlyVolume: 45000, category: 'Insulation' },
  { code: 'AMB-INS-06620', description: 'Drain Pan Insulation Foam', specification: 'PE foam 5mm, die-cut, self-adhesive', material: 'Cross-linked PE foam', currentUnitCost: 42, quarterlyVolume: 45000, category: 'Insulation' },
  { code: 'AMB-WRH-07701', description: 'IDU-ODU Interconnect Harness 4C', specification: '4-core 1.5sqmm, 5m, moulded plugs', material: 'Copper / PVC', currentUnitCost: 385, quarterlyVolume: 43000, category: 'Wiring Harness' },
  { code: 'AMB-WRH-07715', description: 'Compressor Terminal Harness', specification: '3-core 2.5sqmm, ring lugs, 0.4m', material: 'Copper / silicone sleeve', currentUnitCost: 92, quarterlyVolume: 37000, category: 'Wiring Harness' },
  { code: 'AMB-WRH-07722', description: 'Sensor Harness Set', specification: 'NTC coil + ambient, 2-pin JST, 1.2m', material: 'Copper / PVC', currentUnitCost: 58, quarterlyVolume: 44000, category: 'Wiring Harness' },
  { code: 'AMB-PLS-08801', description: 'IDU Front Panel Assembly', specification: 'ABS, high-gloss white, UV stabilized', material: 'ABS', currentUnitCost: 340, quarterlyVolume: 45000, category: 'Plastics' },
  { code: 'AMB-PLS-08812', description: 'Air Deflector Louvre Set', specification: 'ABS, matte finish, 4-piece set', material: 'ABS', currentUnitCost: 88, quarterlyVolume: 45000, category: 'Plastics' },
  { code: 'AMB-PLS-08820', description: 'ODU Fan Guard Grille', specification: 'PP, UV stabilized, black', material: 'Polypropylene', currentUnitCost: 74, quarterlyVolume: 42000, category: 'Plastics' },
  { code: 'AMB-HEX-09901', description: 'Condenser Coil Assembly 2-Row', specification: '9.52mm tube, hydrophilic blue fins', material: 'Copper / Aluminium fins', currentUnitCost: 2340, quarterlyVolume: 21000, category: 'Heat Exchanger' },
  { code: 'AMB-HEX-09912', description: 'Evaporator Coil Assembly', specification: '7mm tube, 3-row, hydrophilic fins', material: 'Copper / Aluminium fins', currentUnitCost: 1890, quarterlyVolume: 22000, category: 'Heat Exchanger' },
];

export function getPartCode(code: string): PartCode | undefined {
  return PART_CODES.find((p) => p.code === code);
}
