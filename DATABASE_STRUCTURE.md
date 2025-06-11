# Структура базы данных

## Модель User (Пользователь)
- `email` (String, уникальный, обязательный) - email пользователя
- `password` (String, обязательный, min 6 символов) - хеш пароля
- `articles` (Array[ObjectId], ссылки на Article) - статьи пользователя

## Модель Article (Статья)
- `title` (String, обязательный) - заголовок статьи
- `content` (String, обязательный) - содержимое статьи
- `author` (ObjectId, ссылка на User, обязательный) - автор статьи
- `comments` (Array[ObjectId], ссылки на Comment) - комментарии к статье
- `createdAt` (Date) - дата создания
- `updatedAt` (Date) - дата обновления

## Модель Comment (Комментарий)
- `text` (String, обязательный) - текст комментария
- `article` (ObjectId, ссылка на Article, обязательный) - статья, к которой относится комментарий
- `author` (ObjectId, ссылка на User, обязательный) - автор комментария
- `createdAt` (Date) - дата создания
- `updatedAt` (Date) - дата обновления

## Связи между моделями
- User имеет много Article (one-to-many)
- User имеет много Comment (one-to-many)
- Article принадлежит одному User (many-to-one)
- Article имеет много Comment (one-to-many)
- Comment принадлежит одному User (many-to-one)
- Comment принадлежит одной Article (many-to-one)

## Индексы
- Поле `email` в модели User имеет уникальный индекс
