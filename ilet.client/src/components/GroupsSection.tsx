import { useTranslation } from 'react-i18next';
import '../styles/groupsSection.css';
import '../styles/commonGroups.css';
import GroupsWrapper from './GroupsWrapper';

export default function GroupsSection() {
    const { t } = useTranslation();

    return (
        <GroupsWrapper>
            <div className="group-item">
                <span className="group-toggle">-</span> {t('Online')}
            </div>
            <div className="group-item">
                <span className="group-toggle">-</span> {t('Offline')}
            </div>
        </GroupsWrapper>
    );
}
