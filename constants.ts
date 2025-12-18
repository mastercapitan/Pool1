
export const POOL_VOLUME_M3 = 70;
export const LOCATION = "Tocopilla, Chile";
export const CLIMATE_FACTORS = {
  evaporationRate: "High (Desert)",
  uvIndex: "Extreme",
  coastalSalinity: "High"
};

// Chemical dosage constants (for 70m3)
export const DOSAGE = {
  PH_DOWN: (current: number, target: number) => {
    // Approx 100ml muriatic acid (30%) per 10m3 per 0.1 units
    const diff = current - target;
    if (diff <= 0) return 0;
    return (diff / 0.1) * (POOL_VOLUME_M3 / 10) * 100; // returns ml
  },
  CHLORINE_SHOCK: () => POOL_VOLUME_M3 * 20, // 20g/m3 = 1.4kg
  ALGAECIDE_SHOCK: () => POOL_VOLUME_M3 * 20, // 20ml/m3 = 1.4L
};
