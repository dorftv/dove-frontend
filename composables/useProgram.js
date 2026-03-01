export function useProgram() {
  const { programMixer, inputs } = useEntities();

  const getInputInfo = (uid) => {
    const matchingInput = inputs.value.find(input => input.uid === uid);
    return matchingInput ? { name: matchingInput.name, type: matchingInput.type, state: matchingInput.state } : null;
  };

  return {
    programMixer,
    getInputInfo,
  };
}
