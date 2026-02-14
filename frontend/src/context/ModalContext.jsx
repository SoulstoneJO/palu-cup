import React, { createContext, useState } from 'react';
import AddMatchModal from '../modals/AddMatchModal';
import EditMatchModal from '../modals/EditMatchModal';
import ManageTeamsModal from '../modals/ManageTeamsModal';
import AddTeamModal from '../modals/AddTeamModal';
import EditTeamModal from '../modals/EditTeamModal';
import ManagePlayersModal from '../modals/ManagePlayersModal';
import DraftOrderModal from '../modals/DraftOrderModal';

// Modal 注册表：将字符串 key 映射到组件
const MODAL_REGISTRY = {
  'addMatch': AddMatchModal,
  'editMatch': EditMatchModal,
  'manageTeams': ManageTeamsModal,
  'addTeam': AddTeamModal,
  'editTeam': EditTeamModal,
  'managePlayers': ManagePlayersModal,
  'draftOrder': DraftOrderModal,
};

export const ModalContext = createContext(null);

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({ type: null, props: {} });

  const showModal = (type, props = {}) => {
    setModalState({ type, props });
  };

  const hideModal = () => {
    setModalState({ type: null, props: {} });
  };

  const renderModal = () => {
    if (!modalState.type) return null;
    const Component = MODAL_REGISTRY[modalState.type];
    if (!Component) return null;
    return <Component {...modalState.props} onClose={hideModal} />;
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      {renderModal()}
    </ModalContext.Provider>
  );
};