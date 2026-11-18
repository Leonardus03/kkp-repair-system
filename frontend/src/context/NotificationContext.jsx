import { createContext, useContext, useState, useCallback } from "react";
import NotificationModal from "../components/NotificationModal.jsx";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [modal, setModal] = useState(null);

  const notify = useCallback((opts) => {
    return new Promise((resolve) => {
      setModal({ ...opts, _resolve: resolve, _inputValue: "" });
    });
  }, []);

  function close(value) {
    modal?._resolve?.(value);
    setModal(null);
  }

  function setInputValue(v) {
    setModal((m) => (m ? { ...m, _inputValue: v } : m));
  }

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {modal && (
        <NotificationModal
          {...modal}
          inputValue={modal._inputValue}
          onInputChange={setInputValue}
          onPrimary={() => close(modal.input ? modal._inputValue : true)}
          onCancel={() => close(false)}
          onSecondary={modal.onSecondary}
          onBackdrop={() => close(false)}
        />
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
