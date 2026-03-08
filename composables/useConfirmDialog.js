import ConfirmDialog from '~/components/ConfirmDialog.vue';

export function useConfirmDialog() {
  const overlay = useOverlay();

  return {
    require({ message, header, accept }) {
      const modal = overlay.create(ConfirmDialog);
      const instance = modal.open({ message, header });
      instance.result.then((accepted) => {
        if (accepted && accept) accept();
      });
    },
  };
}
