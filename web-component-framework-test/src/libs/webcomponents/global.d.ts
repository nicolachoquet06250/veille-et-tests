export default {};

declare global {
    interface Window {
        componentParameters: Record<string, string[]>;
        componentFunctionString: Record<string, string>;
        componentId: Record<string, string>;
    }
}