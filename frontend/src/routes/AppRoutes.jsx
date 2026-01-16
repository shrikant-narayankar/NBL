import { Routes, Route } from 'react-router-dom';
import { PATHS } from './paths';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import Books from '../pages/Books';
import Members from '../pages/Members';
import Borrow from '../pages/Borrow';
import IssueBook from '../pages/IssueBook';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path={PATHS.HOME} element={<Layout />}>
                <Route index element={<Home />} />
                <Route path={PATHS.BOOKS} element={<Books />} />
                <Route path={PATHS.MEMBERS} element={<Members />} />
                <Route path={PATHS.BORROW} element={<Borrow />} />
                <Route path={PATHS.ISSUE_BOOK} element={<IssueBook />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
