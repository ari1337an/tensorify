"use server";

export interface TensorifyVersion {
  id: string;
  version: string;
}

export async function getTensorifyVersions(): Promise<TensorifyVersion[]> {
  return [{ id: "811264f7-5d8f-46b5-853e-8ad6caeae10b", version: "1.0.0" }];
}
