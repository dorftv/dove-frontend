
export const useCreateScene = () => {
    const baseCreate = useCreateEntity('scenes');
    const { addScene } = useDoveConfig();

    return {
      ...baseCreate,
      addScene,
    };
  };