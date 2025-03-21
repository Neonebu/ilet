// components/GroupsSection.tsx
import { useTranslation } from 'react-i18next';
import '../styles/groupsSection.css';
export default function GroupsSection() {
    const { t } = useTranslation();

    return (
        <div className="groups-bar">
            <div className="group-item">
                <span className="group-toggle">-</span> {t('Online')}
            </div>
            <div className="group-item">
                <span className="group-toggle">-</span> {t('Offline')}
            </div>
            <div className="group-item">
                <span className="group-toggle">-</span> {t('World')}
            </div>
        </div>
    );
}
