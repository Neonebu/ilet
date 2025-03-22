import { ReactNode } from 'react';
import '../styles/commonGroups.css';

interface Props {
    children: ReactNode;
}

export default function GroupsWrapper({ children }: Props) {
    return (
        <div className="groups-wrapper">
            {children}
        </div>
    );
}
