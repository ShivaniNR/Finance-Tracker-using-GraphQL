// useQuickModal.js
import { useState } from "react";

export function useQuickModal(onSubmitHandler) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  const openModal = (transaction = null) => {
    setEditingTransaction(transaction);
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  // ✅ Return a component instead of raw JSX
  return {
    isOpen,
    openModal,
    closeModal,
    editingTransaction,
    isVoiceMode,
    setIsVoiceMode,
    onSubmitHandler,
  };

}
