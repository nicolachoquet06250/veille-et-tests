import { ref, watch, getCurrentInstance, Ref, UnwrapRef } from 'vue';

type UseModel<
    Props, 
    Key extends keyof Props | (keyof Props)[]
> = Key extends (keyof Props)[] 
    ? {
        [K in keyof Key]: Key[K] extends keyof Props ? Ref<UnwrapRef<Props[Key[K]]>> : never
    } : Key extends keyof Props 
        ? Ref<UnwrapRef<Props[Key]>> : never;

export const useModel = <
    Props,
    Key extends keyof Props | (keyof Props)[]
>(name: Key): UseModel<Props, Key> => {
    const currentInstance = getCurrentInstance();

    if (currentInstance && 'emitsOptions' in currentInstance) {
        currentInstance.emitsOptions = {
            ...(currentInstance?.emitsOptions ?? {}),
            [`update:${name as string}`]: null,
        };
    }

    const $emit = currentInstance?.emit;
    const $props = currentInstance?.props as Props;

    const generateReturn = (name: Key): UseModel<Props, Key> => {
        const result = ref($props[name as keyof Props]);

        watch(result, (result) => {
                if (!$emit) {
                    console.warn(`emit function doesn't exist.`);
                }
                $emit?.(`update:${name as string}`, result);
            },
            {deep: true}
        );

        watch(
          () => $props[name as keyof Props],
          (property) => {
            if (JSON.stringify(result.value) !== JSON.stringify(property)) {
                result.value = property as UnwrapRef<Props[keyof Props]>;
            }
          }
        );

        return result as UseModel<Props, Key>;
    };

    return typeof name === 'string' 
        ? generateReturn(name) 
        : (name as string[])
            .map(name => generateReturn(name as Key)) as unknown as UseModel<Props, Key>;
};