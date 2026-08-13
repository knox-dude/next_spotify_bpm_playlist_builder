import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AppHeader from '../../components/AppHeader';
import { signOut } from 'next-auth/react';

jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
}));

describe('AppHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the sign out button', () => {
    render(<AppHeader />);
    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });

  test('signs out back to the login page', () => {
    render(<AppHeader />);
    fireEvent.click(screen.getByText('Sign out'));
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/login' });
  });
});
