"use client";
import React, { createContext } from 'react';
import { SelectedPlaylistsProvider } from "../providers/SelectedPlaylistsProvider";
import BpmSubmitForm from './BpmSubmitForm';
import { AuthSession } from '../types/types';

function BpmFormHolder({session}:{session: AuthSession}) {
  return (
    <SelectedPlaylistsProvider>
      <BpmSubmitForm session={session}/>
    </SelectedPlaylistsProvider>
  )
}

export default BpmFormHolder;