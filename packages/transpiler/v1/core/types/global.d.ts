export interface Layer {
  type: string;
  child?: Layer | Layer[];
  settings?:
    | { [key: string]: string | number }
    | {
        layers: Layer[]; // Nested layers
        dataFlow: string; // Data flow instructions
      };
}

export interface Model {
  layers: Layer[];
}

export type Children = Layer | Layer[] | null;
