export function ellipseAddress(address: string, width = 6): string {
  return `${address.slice(0, width)}...${address.slice(-width)}`;
}
