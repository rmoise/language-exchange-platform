'use client'

import { useState } from 'react'
import {
  Popover,
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Tabs,
  Tab,
  useTheme,
  Grid,
} from '@mui/material'
import {
  Search as SearchIcon,
  Close as CloseIcon,
  SentimentSatisfiedAlt as EmojiIcon,
  AccessTime as RecentIcon,
  EmojiEmotions as SmileysIcon,
  Pets as AnimalsIcon,
  EmojiFoodBeverage as FoodIcon,
  DirectionsCar as TravelIcon,
  EmojiEvents as ActivitiesIcon,
  EmojiObjects as ObjectsIcon,
  EmojiSymbols as SymbolsIcon,
  Flag as FlagsIcon,
} from '@mui/icons-material'

interface EmojiCategory {
  id: string
  label: string
  icon: React.ReactNode
  emojis: string[]
}

const emojiCategories: EmojiCategory[] = [
  {
    id: 'recent',
    label: 'Recent',
    icon: <RecentIcon />,
    emojis: ['😀', '❤️', '👍', '🎉', '🔥', '✨', '💯', '🚀'],
  },
  {
    id: 'smileys',
    label: 'Smileys & People',
    icon: <SmileysIcon />,
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
      '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
      '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪',
      '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
      '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
      '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕',
      '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯',
      '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁',
      '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨',
      '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞',
      '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬',
      '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺',
      '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻',
      '😼', '😽', '🙀', '😿', '😾', '🙈', '🙉', '🙊',
    ],
  },
  {
    id: 'animals',
    label: 'Animals & Nature',
    icon: <AnimalsIcon />,
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
      '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵',
      '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤',
      '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗',
      '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜',
      '🦟', '🦗', '🕷', '🦂', '🐢', '🐍', '🦎', '🦖',
      '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠',
      '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆',
      '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫',
      '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏',
      '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐈',
      '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊', '🐇',
      '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿',
      '🦔', '🌵', '🎄', '🌲', '🌳', '🌴', '🌱', '🌿',
      '☘️', '🍀', '🎍', '🎋', '🍃', '🍂', '🍁', '🍄',
      '🐚', '🌾', '💐', '🌷', '🌹', '🥀', '🌺', '🌸',
      '🌼', '🌻', '🌞', '🌝', '🌛', '🌜', '🌚', '🌕',
    ],
  },
  {
    id: 'food',
    label: 'Food & Drink',
    icon: <FoodIcon />,
    emojis: [
      '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇',
      '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝',
      '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🌽',
      '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥖', '🥨',
      '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩',
      '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙',
      '🧆', '🌮', '🌯', '🥗', '🥘', '🥫', '🍝', '🍜',
      '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙',
      '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧',
      '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭',
      '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯',
      '🥛', '🍼', '☕', '🍵', '🧃', '🥤', '🍶', '🍺',
      '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾',
    ],
  },
  {
    id: 'travel',
    label: 'Travel & Places',
    icon: <TravelIcon />,
    emojis: [
      '🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑',
      '🚒', '🚐', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼',
      '🛴', '🚲', '🛵', '🏍', '🛺', '🚨', '🚔', '🚍',
      '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞',
      '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊',
      '🚉', '✈️', '🛫', '🛬', '🛩', '💺', '🛰', '🚀',
      '🛸', '🚁', '🛶', '⛵', '🚤', '🛥', '🛳', '⛴',
      '🚢', '⚓', '⛽', '🚧', '🚦', '🚥', '🚏', '🗺',
      '🗿', '🗽', '🗼', '🏰', '🏯', '🏟', '🎡', '🎢',
      '🎠', '⛲', '⛱', '🏖', '🏝', '🏜', '🌋', '⛰',
      '🏔', '🗻', '🏕', '⛺', '🏠', '🏡', '🏘', '🏚',
      '🏗', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦',
      '🏨', '🏪', '🏫', '🏩', '💒', '🏛', '⛪', '🕌',
      '🕍', '🛕', '🕋', '⛩', '🛤', '🛣', '🗾', '🎑',
    ],
  },
  {
    id: 'activities',
    label: 'Activities',
    icon: <ActivitiesIcon />,
    emojis: [
      '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉',
      '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍',
      '🏏', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊',
      '🥋', '🎽', '🛹', '🛷', '⛸', '🥌', '🎿', '⛷',
      '🏂', '🪂', '🏋️', '🏋️‍♀️', '🏋️‍♂️', '🤼', '🤼‍♀️', '🤼‍♂️',
      '🤸', '🤸‍♀️', '🤸‍♂️', '⛹️', '⛹️‍♀️', '⛹️‍♂️', '🤺', '🤾',
      '🤾‍♀️', '🤾‍♂️', '🏌️', '🏌️‍♀️', '🏌️‍♂️', '🏇', '🧘', '🧘‍♀️',
      '🧘‍♂️', '🏄', '🏄‍♀️', '🏄‍♂️', '🏊', '🏊‍♀️', '🏊‍♂️', '🤽',
      '🤽‍♀️', '🤽‍♂️', '🚣', '🚣‍♀️', '🚣‍♂️', '🧗', '🧗‍♀️', '🧗‍♂️',
      '🚵', '🚵‍♀️', '🚵‍♂️', '🚴', '🚴‍♀️', '🚴‍♂️', '🏆', '🥇',
      '🥈', '🥉', '🏅', '🎖', '🏵', '🎗', '🎫', '🎟',
      '🎪', '🤹', '🤹‍♀️', '🤹‍♂️', '🎭', '🩰', '🎨', '🎬',
      '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸',
      '🪕', '🎻', '🎲', '🪅', '🎯', '🎳', '🎮', '🎰',
    ],
  },
  {
    id: 'objects',
    label: 'Objects',
    icon: <ObjectsIcon />,
    emojis: [
      '⌚', '📱', '📲', '💻', '⌨️', '🖥', '🖨', '🖱',
      '🖲', '🕹', '🗜', '💽', '💾', '💿', '📀', '📼',
      '📷', '📸', '📹', '🎥', '📽', '🎞', '📞', '☎️',
      '📟', '📠', '📺', '📻', '🎙', '🎚', '🎛', '🧭',
      '⏱', '⏲', '⏰', '🕰', '⌛', '⏳', '📡', '🔋',
      '🔌', '💡', '🔦', '🕯', '🪔', '🧯', '🛢', '💸',
      '💵', '💴', '💶', '💷', '💰', '💳', '🧾', '💎',
      '⚖️', '🧰', '🔧', '🔨', '⚒', '🛠', '⛏', '🔩',
      '⚙️', '🧱', '⛓', '🧲', '🔫', '💣', '🧨', '🪓',
      '🔪', '🗡', '⚔️', '🛡', '🚬', '⚰️', '⚱️', '🏺',
      '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳',
      '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫',
      '🧪', '🌡', '🧹', '🧺', '🧻', '🚽', '🚰', '🚿',
      '🛁', '🛀', '🧼', '🪒', '🧽', '🧴', '🛎', '🔑',
      '🗝', '🚪', '🪑', '🛋', '🛏', '🛌', '🧸', '🖼',
      '🛍', '🛒', '🎁', '🎈', '🎏', '🎀', '🎊', '🎉',
      '🧨', '🎈', '🎏', '🎀', '🎊', '🎉', '🎎', '🏮',
      '🎐', '🧧', '✉️', '📩', '📨', '📧', '💌', '📥',
      '📤', '📦', '🏷', '📪', '📫', '📬', '📭', '📮',
      '📯', '📜', '📃', '📄', '📑', '🧾', '📊', '📈',
      '📉', '🗒', '🗓', '📆', '📅', '🗑', '📇', '🗃',
      '🗳', '🗄', '📋', '📁', '📂', '🗂', '🗞', '📰',
      '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚',
      '📖', '🔖', '🧷', '🔗', '📎', '🖇', '📐', '📏',
      '🧮', '📌', '📍', '✂️', '🖊', '🖋', '✒️', '🖌',
      '🖍', '📝', '✏️', '🔍', '🔎', '🔏', '🔐', '🔒',
      '🔓',
    ],
  },
  {
    id: 'symbols',
    label: 'Symbols',
    icon: <SymbolsIcon />,
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
      '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
      '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉', '☸️',
      '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈',
      '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐',
      '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️',
      '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️',
      '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹',
      '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌',
      '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️',
      '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗',
      '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️',
      '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯',
      '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀',
      '💤', '🏧', '🚾', '♿', '🅿️', '🈳', '🈂️', '🛂',
      '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮',
      '🎦', '📶', '🈁', '🔣', '💹', '🔤', '🔡', '🔠',
      '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣',
      '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣',
      '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸', '⏯',
      '⏹', '⏺', '⏭', '⏮', '⏩', '⏪', '⏫', '⏬',
      '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️',
      '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️',
      '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶',
      '➕', '➖', '➗', '✖️', '♾', '💲', '💱', '™️',
      '©️', '®️', '〰️', '➰', '➿', '🔚', '🔙', '🔛',
      '🔝', '🔜', '✔️', '☑️', '🔘', '🔴', '🟠', '🟡',
      '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺', '🔻',
      '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️',
      '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩',
      '🟦', '🟪', '⬛', '⬜', '🟫', '🔈', '🔇', '🔉',
      '🔊', '🔔', '🔕', '📣', '📢', '💬', '💭', '🗯',
      '♠️', '♣️', '♥️', '♦️', '🃏', '🎴', '🀄', '🕐',
      '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘',
      '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟', '🕠',
      '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧',
    ],
  },
  {
    id: 'flags',
    label: 'Flags',
    icon: <FlagsIcon />,
    emojis: [
      '🏳️', '🏴', '🏴‍☠️', '🏁', '🚩', '🏳️‍🌈', '🏳️‍⚧️', '🇺🇳',
      '🇦🇫', '🇦🇽', '🇦🇱', '🇩🇿', '🇦🇸', '🇦🇩', '🇦🇴', '🇦🇮',
      '🇦🇶', '🇦🇬', '🇦🇷', '🇦🇲', '🇦🇼', '🇦🇺', '🇦🇹', '🇦🇿',
      '🇧🇸', '🇧🇭', '🇧🇩', '🇧🇧', '🇧🇾', '🇧🇪', '🇧🇿', '🇧🇯',
      '🇧🇲', '🇧🇹', '🇧🇴', '🇧🇦', '🇧🇼', '🇧🇷', '🇮🇴', '🇻🇬',
      '🇧🇳', '🇧🇬', '🇧🇫', '🇧🇮', '🇰🇭', '🇨🇲', '🇨🇦', '🇮🇨',
      '🇨🇻', '🇧🇶', '🇰🇾', '🇨🇫', '🇹🇩', '🇨🇱', '🇨🇳', '🇨🇽',
      '🇨🇨', '🇨🇴', '🇰🇲', '🇨🇬', '🇨🇩', '🇨🇰', '🇨🇷', '🇨🇮',
      '🇭🇷', '🇨🇺', '🇨🇼', '🇨🇾', '🇨🇿', '🇩🇰', '🇩🇯', '🇩🇲',
      '🇩🇴', '🇪🇨', '🇪🇬', '🇸🇻', '🇬🇶', '🇪🇷', '🇪🇪', '🇸🇿',
      '🇪🇹', '🇪🇺', '🇫🇰', '🇫🇴', '🇫🇯', '🇫🇮', '🇫🇷', '🇬🇫',
      '🇵🇫', '🇹🇫', '🇬🇦', '🇬🇲', '🇬🇪', '🇩🇪', '🇬🇭', '🇬🇮',
      '🇬🇷', '🇬🇱', '🇬🇩', '🇬🇵', '🇬🇺', '🇬🇹', '🇬🇬', '🇬🇳',
      '🇬🇼', '🇬🇾', '🇭🇹', '🇭🇳', '🇭🇰', '🇭🇺', '🇮🇸', '🇮🇳',
      '🇮🇩', '🇮🇷', '🇮🇶', '🇮🇪', '🇮🇲', '🇮🇱', '🇮🇹', '🇯🇲',
      '🇯🇵', '🎌', '🇯🇪', '🇯🇴', '🇰🇿', '🇰🇪', '🇰🇮', '🇽🇰',
      '🇰🇼', '🇰🇬', '🇱🇦', '🇱🇻', '🇱🇧', '🇱🇸', '🇱🇷', '🇱🇾',
      '🇱🇮', '🇱🇹', '🇱🇺', '🇲🇴', '🇲🇬', '🇲🇼', '🇲🇾', '🇲🇻',
      '🇲🇱', '🇲🇹', '🇲🇭', '🇲🇶', '🇲🇷', '🇲🇺', '🇾🇹', '🇲🇽',
      '🇫🇲', '🇲🇩', '🇲🇨', '🇲🇳', '🇲🇪', '🇲🇸', '🇲🇦', '🇲🇿',
      '🇲🇲', '🇳🇦', '🇳🇷', '🇳🇵', '🇳🇱', '🇳🇨', '🇳🇿', '🇳🇮',
      '🇳🇪', '🇳🇬', '🇳🇺', '🇳🇫', '🇰🇵', '🇲🇰', '🇲🇵', '🇳🇴',
      '🇴🇲', '🇵🇰', '🇵🇼', '🇵🇸', '🇵🇦', '🇵🇬', '🇵🇾', '🇵🇪',
      '🇵🇭', '🇵🇳', '🇵🇱', '🇵🇹', '🇵🇷', '🇶🇦', '🇷🇪', '🇷🇴',
      '🇷🇺', '🇷🇼', '🇼🇸', '🇸🇲', '🇸🇹', '🇸🇦', '🇸🇳', '🇷🇸',
      '🇸🇨', '🇸🇱', '🇸🇬', '🇸🇽', '🇸🇰', '🇸🇮', '🇬🇸', '🇸🇧',
      '🇸🇴', '🇿🇦', '🇰🇷', '🇸🇸', '🇪🇸', '🇱🇰', '🇧🇱', '🇸🇭',
      '🇰🇳', '🇱🇨', '🇵🇲', '🇻🇨', '🇸🇩', '🇸🇷', '🇸🇪', '🇨🇭',
      '🇸🇾', '🇹🇼', '🇹🇯', '🇹🇿', '🇹🇭', '🇹🇱', '🇹🇬', '🇹🇰',
      '🇹🇴', '🇹🇹', '🇹🇳', '🇹🇷', '🇹🇲', '🇹🇨', '🇹🇻', '🇻🇮',
      '🇺🇬', '🇺🇦', '🇦🇪', '🇬🇧', '🏴󐁧󐁢󐁥󐁮󐁧󐁿', '🏴󐁧󐁢󐁳󐁣󐁴󐁿', '🏴󐁧󐁢󐁷󐁬󐁳󐁿', '🇺🇸',
      '🇺🇾', '🇺🇿', '🇻🇺', '🇻🇦', '🇻🇪', '🇻🇳', '🇼🇫', '🇪🇭',
      '🇾🇪', '🇿🇲', '🇿🇼',
    ],
  },
]

interface EmojiPickerProps {
  anchorEl: HTMLElement | null
  open: boolean
  onClose: () => void
  onSelectEmoji: (emoji: string) => void
}

export default function EmojiPicker({ anchorEl, open, onClose, onSelectEmoji }: EmojiPickerProps) {
  const [selectedTab, setSelectedTab] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const theme = useTheme()

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue)
  }

  const handleEmojiClick = (emoji: string) => {
    onSelectEmoji(emoji)
    // Optionally close the picker after selection
    // onClose()
  }

  const filteredEmojis = searchQuery
    ? emojiCategories
        .flatMap((category) => category.emojis)
        .filter((emoji) => emoji.includes(searchQuery))
    : emojiCategories[selectedTab].emojis

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      PaperProps={{
        sx: {
          width: 350,
          height: 435,
          borderRadius: 2,
          boxShadow: theme.shadows[8],
          overflow: 'hidden',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box
          sx={{
            p: 1.5,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <TextField
            placeholder="Search emoji"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 8,
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                '& fieldset': { border: 'none' },
              },
            }}
          />
          <IconButton size="small" onClick={onClose}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* Category Tabs */}
        {!searchQuery && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 40,
                '& .MuiTab-root': {
                  minHeight: 40,
                  minWidth: 40,
                  p: 1,
                },
              }}
            >
              {emojiCategories.map((category) => (
                <Tab
                  key={category.id}
                  icon={category.icon as React.ReactElement}
                  aria-label={category.label}
                  sx={{
                    '& .MuiSvgIcon-root': {
                      fontSize: 20,
                    },
                  }}
                />
              ))}
            </Tabs>
          </Box>
        )}

        {/* Emoji Grid */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 1,
          }}
        >
          <Grid container spacing={0.5}>
            {filteredEmojis.map((emoji, index) => (
              <Grid item key={index}>
                <Paper
                  component="button"
                  onClick={() => handleEmojiClick(emoji)}
                  sx={{
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    fontSize: 24,
                    borderRadius: 1,
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                      transform: 'scale(1.2)',
                    },
                  }}
                  elevation={0}
                >
                  {emoji}
                </Paper>
              </Grid>
            ))}
          </Grid>

          {searchQuery && filteredEmojis.length === 0 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 200,
                color: 'text.secondary',
              }}
            >
              <EmojiIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
              <Typography variant="body2">No emoji found</Typography>
            </Box>
          )}
        </Box>

        {/* Footer - Category Name */}
        {!searchQuery && (
          <Box
            sx={{
              p: 1,
              borderTop: 1,
              borderColor: 'divider',
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
              {emojiCategories[selectedTab].label}
            </Typography>
          </Box>
        )}
      </Box>
    </Popover>
  )
}