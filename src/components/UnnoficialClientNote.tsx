export default function UnnoficialClientNote() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 px-6 pb-6">
      <div className="pointer-events-auto ml-auto max-w-xl rounded-xl bg-white p-6 shadow-lg ring-1 ring-gray-900/10">
        <p className="text-sm leading-6 text-gray-900">
          Lorcanito is in no way affiliated with Disney. All intellectual IP
          belongs to Disney®, Lorcana™, and set names are trademarks of Disney.
          Lorcana characters, cards, logos, and art are property of Disney.
          Lorcanito is not a digital gaming product.{" "}
          <a href="#" className="font-semibold text-indigo-600">
            about us
          </a>
          .
        </p>
        <div className="mt-4 flex items-center gap-x-5">
          <button
            type="button"
            className="rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            I understand
          </button>
          <button
            type="button"
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            I don't understand
          </button>
        </div>
      </div>
    </div>
  );
}
