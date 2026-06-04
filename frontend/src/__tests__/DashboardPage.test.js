import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';

// Mock the services
jest.mock('../services/taskService', () => ({
  __esModule: true,
  default: {
    getTasks: jest.fn().mockResolvedValue({ tasks: [] }),
    createTask: jest.fn(),
    getTask: jest.fn(),
    updateTask: jest.fn().mockResolvedValue({}),
    deleteTask: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('../services/sessionService', () => ({
  __esModule: true,
  default: {
    getSessions: jest.fn().mockResolvedValue({ sessions: [] }),
  },
}));

jest.mock('../services/recommendationService', () => ({
  __esModule: true,
  default: {
    getRecommendations: jest.fn().mockResolvedValue({ recommendations: [] }),
    acceptRecommendation: jest.fn().mockResolvedValue({}),
    rejectRecommendation: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('../context/AuthContext', () => {
  const ReactMock = require('react');
  return {
    AuthContext: ReactMock.createContext({
      user: { firstName: 'Test', email: 'test@example.com' },
      isAuthenticated: true,
      loading: false,
    }),
    AuthProvider: ({ children }) => children,
  };
});

jest.mock('../context/SocketContext', () => ({
  useSocket: () => ({
    socket: {
      on: jest.fn(),
      off: jest.fn(),
    },
  }),
}));

jest.mock('../context/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light',
  }),
}));

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );

describe('DashboardPage', () => {
  it('should render dashboard with welcome banner', async () => {
    renderDashboard();

    const welcomeText = await screen.findByText(/Welcome back/i);
    expect(welcomeText).toBeInTheDocument();
  });

  it('should display stat cards', async () => {
    renderDashboard();

    expect(await screen.findByText(/Overall progress/i)).toBeInTheDocument();
    expect(await screen.findByText(/Due soon/i)).toBeInTheDocument();
    expect(await screen.findByText(/Overdue/i)).toBeInTheDocument();
    expect(await screen.findByText(/Sessions completed/i)).toBeInTheDocument();
  });

  it('should display recommendations section', async () => {
    renderDashboard();

    const recommendationHeading = await screen.findByText(/Smart recommendations/i);
    expect(recommendationHeading).toBeInTheDocument();
  });

  it('should display upcoming tasks section', async () => {
    renderDashboard();

    const upcomingHeading = await screen.findByText(/Upcoming tasks/i);
    expect(upcomingHeading).toBeInTheDocument();
  });
});
