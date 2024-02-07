<script setup lang="ts">
import { useModel } from '../composables/useModel';

type Props = {
    modelValue: {
        hello: string,
        world: {
            name: string
        }
    },
    test: string
};

defineProps<Props>();

const modelValue = useModel<Props, 'modelValue'>('modelValue');
const test = useModel<Props, 'test'>('test');

const [_modelValue, _test] = useModel<Props, ['modelValue', 'test']>(['modelValue', 'test']);

setTimeout(() => {
  modelValue.value.hello = 'Yann';
  modelValue.value.world.name = 'Yann w';
  test.value = 'Yann';
}, 4000);

setTimeout(() => {
  _modelValue.value.hello = 'Toto';
  _modelValue.value.world.name = 'Toto w';
  _test.value = 'Toto';
}, 8000);
</script>

<template>
    <div>
        Test: Hello {{ modelValue.hello }} ({{ modelValue.world.name }}) => {{ test }}
    </div>
</template>

<style scoped>
* {
    text-align: left;
}
</style>