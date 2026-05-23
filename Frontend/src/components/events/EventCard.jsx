import { Link } from 'react-router-dom';
import { memo } from 'react';

const CATEGORY_COLORS = {
  'Technology':       'bg-blue-50 text-blue-700',
  'Sports':           'bg-red-50 text-red-700',
  'Arts':             'bg-purple-50 text-purple-700',
  'Music':            'bg-pink-50 text-pink-700',
  'Food & Drink':     'bg-amber-50 text-amber-700',
  'Education':        'bg-emerald-50 text-emerald-700',
  'Health & Wellness':'bg-teal-50 text-teal-700',
  'Community':        'bg-indigo-50 text-indigo-700',
};
const getCategoryClasses = (category) => CATEGORY_COLORS[category] || 'bg-slate-100 text-slate-600';

const EventCard = memo(({ event }) => {
  const { _id, title, date, category, location, organizerName, attendeeCount } = event;

  // Format date
  const eventDate = new Date(date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <Link to={`/events/${_id}`} className="block group h-full">
      <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl overflow-hidden flex flex-col h-full transition-shadow duration-200 hover:shadow-md hover:ring-blue-300">
        <div className="p-5 flex-grow space-y-4">
          <div className="flex justify-between items-start gap-4">
            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
              {title}
            </h3>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${getCategoryClasses(category)}`}>
              {category}
            </span>
          </div>

          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formattedDate} • {formattedTime}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate" title={location?.name}>{location?.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="truncate">By {organizerName}</span>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-sm flex justify-between items-center text-slate-500">
          <span>{attendeeCount || 0} attending</span>
          <span className="font-medium text-blue-600 group-hover:underline">View details</span>
        </div>
      </div>
    </Link>
  );
});

EventCard.displayName = 'EventCard';

export default EventCard;
