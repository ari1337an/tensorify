import { spawnSync } from 'child_process';

export function formatPythonCodeWithBlack(code: string): string {
  const process = spawnSync('black', ['-', '--quiet', '--line-length', '80'], {
    input: code,
    encoding: 'utf-8',
  });

  if (process.error) {
    console.error('Error executing Black:', process.error);
    return code; // Return unformatted code on error
  }

  if (process.status !== 0) {
    console.error('Black formatting failed:', process.stderr);
    return code; // Return unformatted code on error
  }

  return process.stdout;
}
