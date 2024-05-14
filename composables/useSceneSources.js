// useSceneSources.js
import { useEntities } from '@/composables/useEntities';
import { ref, watch } from 'vue';

export function useSceneSources(scene, source) {
  const { inputs, updateEntity: updateEntityInEntities } = useEntities();

  const src = ref(source.src);
  const alpha = ref(source.alpha * 100);
  const width = ref(source.width);
  const height = ref(source.height);
  const xpos = ref(source.xpos);
  const ypos = ref(source.ypos);
  const volume = ref(source.volume * 100);
  const mute = ref(source.mute);

  watch(
    () => source.alpha,
    (newValue) => {
      alpha.value = newValue * 100;
    }
  );

  watch(
    () => source.volume,
    (newValue) => {
      volume.value = newValue * 100;
    }
  );

  watch(
    () => source.mute, // Watch for changes in source.mute
    (newValue) => {
      mute.value = newValue;
    }
  );

  const handleChange = (prop, newValue) => {
    switch (prop) {
      case 'src':
        src.value = newValue;
        break;
      case 'alpha':
        alpha.value = newValue;
        newValue = newValue / 100;
        break;
      case 'width':
        width.value = newValue;
        break;
      case 'height':
        height.value = newValue;
        break;
      case 'xpos':
        xpos.value = newValue;
        break;
      case 'ypos':
        ypos.value = newValue;
        break;
      case 'volume':
        volume.value = newValue;
        newValue = newValue / 100;
        break;
      case 'mute': // Handle mute value change
        mute.value = newValue;
        break;
    }

    updateEntityInEntities('mixer', {
      uid: scene.uid,
      index: source.index,
      [prop]: newValue
    });
  };

  const getMax = (type) => {
    const typeMaxMap = {
      'src': false,
      'alpha': 100,
      'width': scene.width,
      'xpos': scene.width,
      'height': scene.height,
      'ypos': scene.height,
      'volume': 150,
    };

    return typeMaxMap[type];
  };

  const removeSlot = async () => {
    const { data: responseData } = await useFetch('/api/mixer/remove_slot', {
      method: 'post',
      body: {
        uid: scene.uid,
        index: source.index
      }
    });
  };

  return {
    inputs,
    updateEntity: handleChange,
    removeSlot,
    handleChange,
    getMax,
    src,
    alpha,
    width,
    height,
    xpos,
    ypos,
    volume,
    mute
  };
}