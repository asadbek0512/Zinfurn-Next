import { NoticeCategory, NoticeStatus } from "../../enums/notice.enum";

export interface NoticeI18n {
	title?: string;
	desc?: string;
}

export interface NoticeTranslations {
	uz?: NoticeI18n;
	en?: NoticeI18n;
	ru?: NoticeI18n;
	kr?: NoticeI18n;
	ar?: NoticeI18n;
}

export interface typeNotice {
	_id: string;
	noticeCategory: NoticeCategory;
	noticeStatus: NoticeStatus;
	noticeTitle: string;
	noticeContent: string;
	noticeTranslations?: NoticeTranslations;
	memberId: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface NoticeInquiry {
	page?: number;
	limit?: number;
	noticeCategory?: NoticeCategory;
	noticeStatus?: NoticeStatus;
	search?: string;
}

export interface AllNoticesInquiry {
	page?: number;
	limit?: number;
	noticeCategory?: NoticeCategory;
	noticeStatus?: NoticeStatus;
	search?: string;
}