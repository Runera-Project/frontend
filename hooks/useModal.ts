'use client';

import { useState, useCallback } from 'react';
import { ModalType } from '@/components/Modal';

interface ModalConfig {
  title: string;
  message: string;
  type?: ModalType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
}

export function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ModalConfig>({
    title: '',
    message: '',
    type: 'info',
  });

  const showModal = useCallback((modalConfig: ModalConfig) => {
    setConfig(modalConfig);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const success = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showModal({
      title,
      message,
      type: 'success',
      confirmText: 'Great!',
      onConfirm,
    });
  }, [showModal]);

  const error = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showModal({
      title,
      message,
      type: 'error',
      confirmText: 'OK',
      onConfirm,
    });
  }, [showModal]);

  const warning = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showModal({
      title,
      message,
      type: 'warning',
      confirmText: 'Got it',
      onConfirm,
    });
  }, [showModal]);

  const info = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showModal({
      title,
      message,
      type: 'info',
      confirmText: 'OK',
      onConfirm,
    });
  }, [showModal]);

  const confirm = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText = 'Confirm',
    cancelText = 'Cancel'
  ) => {
    showModal({
      title,
      message,
      type: 'warning',
      confirmText,
      cancelText,
      onConfirm,
      showCancel: true,
    });
  }, [showModal]);

  return {
    isOpen,
    config,
    showModal,
    closeModal,
    success,
    error,
    warning,
    info,
    confirm,
  };
}
