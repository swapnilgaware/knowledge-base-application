# Demo book sources

The development profile seeds these complete Project Gutenberg plain-text editions, retrieved on 2026-10-03:

| Resource | Work | Source edition | Text source |
| --- | --- | --- | --- |
| alice.txt | Alice's Adventures in Wonderland — Lewis Carroll | [Ebook 11](https://www.gutenberg.org/ebooks/11) | [Plain text](https://www.gutenberg.org/cache/epub/11/pg11.txt) |
| looking-glass.txt | Through the Looking-Glass — Lewis Carroll | [Ebook 12](https://www.gutenberg.org/ebooks/12) | [Plain text](https://www.gutenberg.org/cache/epub/12/pg12.txt) |
| sherlock.txt | The Adventures of Sherlock Holmes — Arthur Conan Doyle | [Ebook 1661](https://www.gutenberg.org/ebooks/1661) | [Plain text](https://www.gutenberg.org/cache/epub/1661/pg1661.txt) |

The source files retain their front matter, attribution, and Project Gutenberg license. The seeder creates twelve readable chapters or stories per book and an additional edition-credits entry containing the front matter and license. Reader chapter numbers are zero-based; the credits entry is index 12 and does not advance reading progress.

These are shared demo editions, not the user's personal books. They are stored as chapter text in PostgreSQL and served through the authenticated reader API. There is no file-download endpoint or button. The reader does not provide copy protection. The application source has no selected license; the included editions retain their own notices.
