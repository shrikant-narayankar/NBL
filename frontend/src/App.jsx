import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Books from './pages/Books';
import Members from './pages/Members';
import Borrow from './pages/Borrow';
import IssueBook from './pages/IssueBook';


import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="books" element={<Books />} />
            <Route path="members" element={<Members />} />
            <Route path="borrow" element={<Borrow />} />
            <Route path="borrow/issue" element={<IssueBook />} />
          </Route>
        </Routes>
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;
