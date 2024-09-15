
export const useCreateScene = () => {
    const baseCreate = useCreateEntity('mixers');
    const { addScene } = useDoveConfig();

    return {
      ...baseCreate,
      addScene,
    };
  };