export function useStateClass() {
  const stateClass = (state) => {
    if (!state) return 'state-null';
    return `state-${state.toLowerCase()}`;
  };

  return { stateClass };
}
