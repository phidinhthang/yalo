import { emojiData, EmojiType } from './emojiData';

interface EmojiPickerProps {
  onPicked: (emoji: EmojiType) => void;
}

export const EmojiPicker = ({ onPicked }: EmojiPickerProps) => {
  console.log('e ', emojiData);
  return (
    <div className='flex w-full flex-wrap p-2 border-2 border-blue-500 rounded-lg bg-gray-100'>
      {emojiData.map((e) => (
        <div className='w-10 h-10 m-1'>
          <button
            className='w-10 h-10 rounded-md bg-white hover:bg-blue-200 flex items-center justify-center'
            onClick={() => {
              onPicked(e);
            }}
          >
            <img
              src={`/emotes${e.imageUrl}`}
              alt={e.name}
              className='w-8 h-8 object-cover'
            />
          </button>
        </div>
      ))}
    </div>
  );
};
