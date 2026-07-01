import { BoardArticleCategory, BoardArticleStatus } from '../../enums/board-article.enum';
import { Member } from '../member/member';
import { MeLiked, TotalCounter } from '../property/property';

export interface ArticleI18n {
	title?: string;
	desc?: string;
}

export interface ArticleTranslations {
	uz?: ArticleI18n;
	en?: ArticleI18n;
	ru?: ArticleI18n;
	kr?: ArticleI18n;
	ar?: ArticleI18n;
}

export interface BoardArticle {
	_id: string;
	articleCategory: BoardArticleCategory;
	articleStatus: BoardArticleStatus;
	articleTitle: string;
	articleContent: string;
	articleImage: string;
	articleTranslations?: ArticleTranslations;
	articleViews: number;
	articleLikes: number;
	articleComments: number;
	memberId: string;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation **/
	meLiked?: MeLiked[];
	memberData?: Member;
}

export interface BoardArticles {
	list: BoardArticle[];
	metaCounter: TotalCounter[];
}
