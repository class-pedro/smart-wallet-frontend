import { useEffect, useState } from 'react';
import { Dashboard } from '../types';
import { useAuth } from '@/hooks/useAuth';
import { getDashboard } from '@/services/dashboard.service';
import { months } from '@/constants/month';

export function useDashboard() {
  const { token, walletId } = useAuth();

  const dashboardDate = new Date();
  const [dashboard, setDashboard] = useState<null | Dashboard>(null);
  const [month, setMonth] = useState(dashboardDate.getMonth());
  const [year, setYear] = useState(dashboardDate.getFullYear());
  const [offset, setOffset] = useState(0);

  const left = months[month === 0 ? 11 : month - 1];
  const center = months[month];
  const right = months[(month + 1) % 12];

  function handleChangeMonth(operation: 'next' | 'prev') {
    setOffset(operation === 'next' ? 1 : -1);
    setTimeout(() => {
      setOffset(0);
      setMonth((m) => {
        let newMonth = operation === 'next' ? m + 1 : m - 1;
        let newYear = year;

        if (newMonth > 11) {
          newMonth = 0;
          newYear = year + 1;
        }

        if (newMonth < 0) {
          newMonth = 11;
          newYear = year - 1;
        }

        setYear(newYear);
        return newMonth;
      });
    }, 150);
  }

  async function useGetDashboard() {
    const dashboardResponse = await getDashboard({
      token: token,
      walletId: walletId,
      month: month + 1,
      year: year,
    });

    if (dashboardResponse) setDashboard(dashboardResponse);
  }

  useEffect(() => {
    useGetDashboard();
  }, [token, walletId, month, year]);

  return { dashboard, handleChangeMonth, year, offset, left, center, right };
}
