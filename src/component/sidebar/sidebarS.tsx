import { UserPlaceholder } from './sidebarC';

export async function Sidebar() {
  return (
    <div className="box-border w-[240px] min-w-[200px] border-r border-[#e6e6e6] bg-[#f9fafb] p-4">
      <h3 className="mb-10 flex justify-between">
        <span className="font-semibold italic">Study AID</span>
      </h3>
      <UserPlaceholder />
      <ul className="m-0 list-none p-0">
        {/* {semesters.map((semester, idx) => {
            const isActive = semester === currentSemester;
            return (
              <li
                key={idx}
                className={`cursor-pointer py-2 transition-colors duration-200 ${
                  isActive ? 'font-bold text-black' : 'text-gray-600'
                } hover:text-black`}
              >
                {semester}
              </li>
            );
          })} */}
      </ul>
    </div>
  );
}
