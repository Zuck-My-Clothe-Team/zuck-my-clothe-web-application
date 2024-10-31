import { useState, useEffect, useRef } from 'react';
import { HomeFilled, MehFilled, FundFilled, ToolFilled, SettingFilled, BulbFilled, FileExclamationFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../utils/axiosInstance';
import { UserDetail } from '../interface/userdetail.interface';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activePage, setActivePage] = useState('Home');
  const [userInfo, setUserInfo] = useState<UserDetail>({
    user_id: '',
    email: '',
    name: '',
    role: '',
    surname: '',
  });
  const sidebarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const getProfile = async() => {
    const response = await axiosInstance.get('/auth/me')
    console.log(response.data)
    setUserInfo(response.data.data)
  } 

  useEffect(() => {
    getProfile()
  },[]) 
  
  const handleMouseEnter = () => {
    setIsOpen(true);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePageChange = (page: string, path: string) => {
    setActivePage(page);
    navigate(path);
  };

  return (
    <div>
      <div
        className="fixed top-0 left-0 h-full w-1"
        onMouseEnter={handleMouseEnter}
      ></div>

      <div
        ref={sidebarRef}
        className={`fixed top-4 left-0 h-[720px] bg-white rounded-lg text-gray-500 p-4 transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-2' : '-translate-x-full'
        }`}
      >
        <nav>
          <img 
            src="/images/logo-withname.png"
            alt="Logo"
            className="w-64 h-full"
          />

          <ul className="space-y-1">
            <li className={`p-2 rounded-md cursor-pointer whitespace-pre ${ activePage === 'Home' ? 'bg-sky-400 text-white' : 'hover:bg-gray-200'}`}
              onClick={() => handlePageChange('Home', '/login')}
            ><HomeFilled style={{ fontSize: '130%' }} /> Home Page</li>

            <li className={`p-2 rounded-md cursor-pointer whitespace-pre ${ activePage === 'Dashboard' ? 'bg-sky-400 text-white' : 'hover:bg-gray-200'}`}
              onClick={() => handlePageChange('Dashboard', '/DashboardPage')}
            ><FundFilled style={{ fontSize: '130%' }} /> Dashboard</li>

            <li className={`p-2 rounded-md cursor-pointer whitespace-pre ${ activePage === 'Machine' ? 'bg-sky-400 text-white' : 'hover:bg-gray-200'}`}
              onClick={() => handlePageChange('Machine', '/MachinePage')}
            ><ToolFilled style={{ fontSize: '130%' }} /> Machine</li>

            <li className={`p-2 rounded-md cursor-pointer whitespace-pre ${ activePage === 'Staff' ? 'bg-sky-400 text-white' : 'hover:bg-gray-200'}`}
              onClick={() => handlePageChange('Staff', '/StaffPage')}
            ><MehFilled style={{ fontSize: '130%' }} /> Staff</li>

            <li className={`p-2 rounded-md cursor-pointer whitespace-pre ${ activePage === 'Report' ? 'bg-sky-400 text-white' : 'hover:bg-gray-200'}`}
              onClick={() => handlePageChange('Report', '/ReportPage')}
            ><FileExclamationFilled style={{ fontSize: '130%' }} /> Report</li>

            <li className={`p-2 rounded-md cursor-pointer whitespace-pre ${ activePage === 'Help' ? 'bg-sky-400 text-white' : 'hover:bg-gray-200'}`}
              onClick={() => handlePageChange('Help', '/HelpPage')}
            ><BulbFilled style={{ fontSize: '130%' }} /> Help</li>

            <li className={`p-2 rounded-md cursor-pointer whitespace-pre ${ activePage === 'Setting' ? 'bg-sky-400 text-white' : 'hover:bg-gray-200'}`}
              onClick={() => handlePageChange('Setting', '/SettingPage')}
            ><SettingFilled style={{ fontSize: '130%' }} /> Setting</li>
          </ul>
        </nav>


        <div className="p-4 text-center border-t border-gray-300 mt-4">
          {userInfo ? (
            <>
              <p className="font-semibold text-lg">{userInfo.name} {userInfo.surname}</p>
              <p className="text-sm text-gray-600">{userInfo.email}</p>
            </>
          ) : (
            <p className="text-sm text-gray-600">Please log in</p>
          )}
        </div>

        <div className="p-4 cursor-pointer" onClick={() => {
            localStorage.removeItem("accessToken");
            setUserInfo({
              user_id: '',
              email: '',
              name: '',
              role: '',
              surname: '',

            });
          }}
        >
          LOGOUT
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
