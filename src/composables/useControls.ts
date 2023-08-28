import { Ref, isRef, provide, reactive, ref, toRefs } from 'vue'

export const CONTROLS_CONTEXT_KEY = Symbol('CONTROLS_CONTEXT_KEY')


export function useControlsProvider() {
  provide(CONTROLS_CONTEXT_KEY, controls)
  return controls
}
// Define the Control type
interface Control {
  label: Ref<string>;
  name: Ref<string>;
  type: Ref<string>;
  value: Ref<any>;
  visible: Ref<boolean>;
  [key: string]: Ref<any> | Ref<boolean>;
}

// Internal state
const controls: { [key: string]: Control } = reactive({});

// Helper function to infer type
const inferType = (value: any): string => {
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string') return 'string';
  if (value.isVector3 || value.isEuler || value instanceof Array) return 'vector';
  if (value.min !== undefined || value.max !== undefined || value.step !== undefined) return 'range';

  // Add more types as needed
  return 'unknown';
};

const createControl = (key: string, value: any, type: string, folderName: string | null): Control => {
  const control: Control = {
    label: ref(key),
    name: ref(key),
    type: ref(type),
    value: ref(value),
    visible: ref(true),
    [key]: ref(value)
  };

  if (folderName) {
    control.folder = ref(folderName);
  }

  return control;
};

export const dispose = (): void => {
  for (const key in controls) {
    delete controls[key];
  }
};

// eslint-disable-next-line max-len
export const useControls = (folderNameOrParams: string | { [key: string]: any }, params?: { [key: string]: any }): Control | Control[] => {
  const result: Control[] = [];

  const folderName = typeof folderNameOrParams === 'string' ? folderNameOrParams : null;
  const controlsParams = folderName ? params! : folderNameOrParams;

  for (const key in controlsParams) {
    let value = controlsParams[key];

    // If the value is an object with control options
    if (typeof value === 'object' && !isRef(value) && !Array.isArray(value) && value.value !== undefined) {
      const controlOptions = value;
      const reactiveValue = isRef(controlOptions.value) ? controlOptions.value : ref(controlOptions.value);
      const control = createControl(key, reactiveValue, inferType(controlOptions), folderName);
      control.min = controlOptions.min ? ref(controlOptions.min) : undefined;
      control.max = controlOptions.max ? ref(controlOptions.max) : undefined;
      control.step = controlOptions.step ? ref(controlOptions.step) : undefined;

      controls[key] = control;
      result.push(control);
      continue;
    }

    // If the value is a ref, use it directly
    if (isRef(value)) {
      const control = createControl(key, value, inferType(value.value), folderName);
      controls[key] = control;
      result.push(control);
      continue;
    }

    // If the value is reactive, convert it to ref
    else if (typeof value === 'object' && !Array.isArray(value)) {
      const reactiveRefs = toRefs(value);
      if (reactiveRefs[key]) {
        value = reactiveRefs[key];
      }
    }

    // For non-ref values
    const control = createControl(key, value, inferType(value), folderName);

    // Update the internal state
    controls[key] = control;
    result.push(control);
  }

  return result.length === 1 ? result[0] : result;
};