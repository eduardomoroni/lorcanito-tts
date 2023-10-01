import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";

const CardContextMenuTrigger = () => (
  <div className="relative z-30 inline-block text-left">
    <div className="flex items-center rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
      <span className="sr-only">Open Card Actions</span>
      <EllipsisVerticalIcon className="h-8 w-8" aria-hidden="true" />
    </div>
  </div>
);

export default CardContextMenuTrigger;
