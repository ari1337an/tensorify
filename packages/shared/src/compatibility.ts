// packages/shared/src/compatibility.ts
export interface VersionSet {
  api: string;
  transpiler: string;
  sdk: string;
  pluginEngine: string;
}

export interface CompatibilityEntry extends VersionSet {
  status: 'stable' | 'beta' | 'alpha' | 'deprecated';
  endOfLife: string | null;
  description: string;
}

export interface CompatibilityMatrix {
  version: string;
  lastUpdated: string;
  compatibilityMatrix: {
    current: VersionSet;
    supported: CompatibilityEntry[];
    deprecated: CompatibilityEntry[];
    incompatible: Array<VersionSet & { reason: string }>;
  };
  rules: {
    sdkCompatibility: Record<string, string[]>;
    apiBackwardCompatibility: Record<string, {
      minTranspiler: string;
      maxTranspiler: string;
    }>;
  };
}

export class CompatibilityValidator {
  private matrix: CompatibilityMatrix;

  constructor(matrix: CompatibilityMatrix) {
    this.matrix = matrix;
  }

  /**
   * Check if a version combination is supported
   */
  isCompatible(versions: VersionSet): boolean {
    const { supported } = this.matrix.compatibilityMatrix;
    return supported.some(entry => 
      entry.api === versions.api &&
      entry.transpiler === versions.transpiler &&
      entry.sdk === versions.sdk &&
      entry.pluginEngine === versions.pluginEngine
    );
  }

  /**
   * Get the recommended version for a given constraint
   */
  getRecommendedVersion(constraint: Partial<VersionSet>): VersionSet | null {
    const { supported } = this.matrix.compatibilityMatrix;
    const candidates = supported.filter(entry => {
      return Object.entries(constraint).every(([key, value]) => 
        entry[key as keyof VersionSet] === value
      );
    });

    // Return stable version first, then latest
    return candidates.find(c => c.status === 'stable') || 
           candidates[candidates.length - 1] || 
           null;
  }

  /**
   * Validate runtime request
   */
  validateRequest(versions: VersionSet): {
    valid: boolean;
    warnings: string[];
    errors: string[];
    recommendations?: VersionSet;
  } {
    const warnings: string[] = [];
    const errors: string[] = [];

    if (!this.isCompatible(versions)) {
      errors.push(`Incompatible version combination: ${JSON.stringify(versions)}`);
      
      // Try to find a compatible alternative
      const recommendation = this.getRecommendedVersion({
        api: versions.api
      });
      
      return {
        valid: false,
        warnings,
        errors,
        recommendations: recommendation || undefined
      };
    }

    // Check for deprecated versions
    const { deprecated } = this.matrix.compatibilityMatrix;
    const isDeprecated = deprecated.some(entry =>
      entry.api === versions.api &&
      entry.transpiler === versions.transpiler &&
      entry.sdk === versions.sdk
    );

    if (isDeprecated) {
      warnings.push('Using deprecated version combination');
    }

    return {
      valid: true,
      warnings,
      errors
    };
  }
}