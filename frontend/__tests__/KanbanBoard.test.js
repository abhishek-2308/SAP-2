import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import KanbanBoard from '../components/KanbanBoard';
import useBoardStore from '../store/boardStore';

// Mock Zustand Store
jest.mock('../store/boardStore');

const mockLists = [
  { id: 1, title: 'To Do', position: 1 },
  { id: 2, title: 'Doing', position: 2 },
];

const mockCards = {
  1: [{ id: 101, title: 'Task 1', list_id: 1, position: 1, labels: [], members: [] }],
  2: [],
};

describe('KanbanBoard UI Snapshots', () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // eslint-disable-next-line react/display-name
    return ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    useBoardStore.mockReturnValue({
      lists: mockLists,
      cards: mockCards,
      currentBoard: { id: 1, title: 'Test Board' },
      moveCardOptimistic: jest.fn(),
      rollbackCardMove: jest.fn(),
    });
  });

  it('Matches UI Snapshot for Default State', () => {
    const { asFragment } = render(<KanbanBoard boardId={1} />, { wrapper: createWrapper() });
    expect(asFragment()).toMatchSnapshot();
  });

  it('Renders the correct number of lists', () => {
    const { getAllByText } = render(<KanbanBoard boardId={1} />, { wrapper: createWrapper() });
    expect(getAllByText(/To Do|Doing/)).toHaveLength(2);
  });
});
