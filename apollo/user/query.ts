import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const GET_AGENTS = gql`
query GetAgents($input: AgentsInquiry!) {
    getAgents(input: $input) {
        list {
            _id
            memberType
            memberStatus
            memberAuthType
            memberPhone
            memberNick
            memberFullName
            memberImage
            memberAddress
            memberDesc
            memberProperties
            memberArticles
            memberFollowers
            memberFollowings
            memberPoints
            memberLikes
            memberViews
            memberComments
            memberRank
            memberWarnings
            memberBlocks
            deletedAt
            createdAt
            updatedAt
            accessToken
            meLiked {
                memberId
                likeRefId
                myFavorite
            }
        }
        metaCounter {
            total
        }
    }
}

`;

export const GET_TECHNICIANS = gql(`
query GetTechnicians($input: TechnicianInquiry!) {
    getTechnicians(input: $input) {
        list {
            _id
            memberType
            memberStatus
            memberAuthType
            memberPhone
            memberNick
            memberFullName
            memberImage
            memberAddress
            memberDesc
            memberProperties
            memberArticles
            memberFollowers
            memberFollowings
            memberPoints
            memberLikes
            memberViews
            memberComments
            memberRank
            memberWarnings
            memberBlocks
            deletedAt
            createdAt
            updatedAt
            accessToken
            meLiked {
                memberId
                likeRefId
                myFavorite
            }
            meFollowed {
                followingId
                followerId
                myFollowing
            }
        }
        metaCounter {
            total
        }
    }
}

`);

export const GET_MEMBER = gql(`
query GetMember($input: String!) {
    getMember(memberId: $input) {
        _id
        memberType
        memberStatus
        memberAuthType
        memberPhone
        memberNick
        memberFullName
        memberImage
        memberAddress
        memberDesc
        memberProperties
        memberArticles
        memberFollowers
        memberFollowings
        memberPoints
        memberLikes
        memberViews
        memberComments
        memberRank
        memberWarnings
        memberBlocks
        deletedAt
        createdAt
        updatedAt
        meLiked {
            memberId
            likeRefId
            myFavorite
        }
        meFollowed {
            followingId
            followerId
            myFollowing
        }
    }
}

`);

/**************************
 *        PROPERTY        *
 *************************/

export const GET_PROPERTY = gql`
query GetProperty($input: String!) {
    getProperty(propertyId: $input) {
        _id
        propertyType
        propertyStatus
        propertyCategory
        propertyMaterial
        propertyColor
        propertySize
        propertyTitle
        propertyPrice
        propertySalePrice
        propertyIsOnSale
        propertySaleExpiresAt
        propertyImages
        propertyDesc
        propertyBarter
        propertyRent
        propertyInStock
        propertyCondition
        propertyBrand
        propertyOriginCountry
        propertyAddress
        propertyViews
        propertyLikes
        propertyComments
        propertyRank
        memberId
        soldAt
        deletedAt
        constructedAt
        createdAt
        updatedAt
        meLiked {
            memberId
            likeRefId
            myFavorite
        }
        memberData {
            _id
            memberType
            memberStatus
            memberAuthType
            memberPhone
            memberNick
            memberFullName
            memberImage
            memberAddress
            memberDesc
            memberProperties
            memberArticles
            memberFollowers
            memberFollowings
            memberPoints
            memberLikes
            memberViews
            memberComments
            memberRank
            memberWarnings
            memberBlocks
            deletedAt
            createdAt
            updatedAt
            accessToken
        }
    }
}

`;

export const GET_PROPERTIES = gql`
query GetProperties($input: PropertiesInquiry!) {
    getProperties(input: $input) {
        list {
            _id
            propertyType
            propertyStatus
            propertyCategory
            propertyMaterial
            propertyColor
            propertySize
            propertyTitle
            propertyPrice
            propertySalePrice
            propertyIsOnSale
            propertySaleExpiresAt
            propertyImages
            propertyDesc
            propertyBarter
            propertyRent
            propertyInStock
            propertyCondition
            propertyBrand
            propertyOriginCountry
            propertyAddress
            propertyViews
            propertyLikes
            propertyComments
            propertyRank
            memberId
            soldAt
            deletedAt
            constructedAt
            createdAt
            updatedAt
            meLiked {
                memberId
                likeRefId
                myFavorite
            }
            memberData {
                _id
                memberType
                memberStatus
                memberAuthType
                memberPhone
                memberNick
                memberFullName
                memberImage
                memberAddress
                memberDesc
                memberProperties
                memberArticles
                memberFollowers
                memberFollowings
                memberPoints
                memberLikes
                memberViews
                memberComments
                memberRank
                memberWarnings
                memberBlocks
                deletedAt
                createdAt
                updatedAt
                accessToken
                meLiked {
                    memberId
                    likeRefId
                    myFavorite
                }
                meFollowed {
                    followingId
                    followerId
                    myFollowing
                }
            }
        }
        metaCounter {
            total
        }
    }
}


`;

export const GET_AGENT_PROPERTIES = gql`
query GetAgentProperties($input: AgentPropertiesInquiry!) {
    getAgentProperties(input: $input) {
        list {
            _id
            propertyType
            propertyStatus
            propertyCategory
            propertyMaterial
            propertyColor
            propertySize
            propertyTitle
            propertyPrice
            propertySalePrice
            propertyIsOnSale
            propertySaleExpiresAt
            propertyImages
            propertyDesc
            propertyBarter
            propertyRent
            propertyInStock
            propertyCondition
            propertyBrand
            propertyOriginCountry
            propertyAddress
            propertyViews
            propertyLikes
            propertyComments
            propertyRank
            memberId
            soldAt
            deletedAt
            constructedAt
            createdAt
            updatedAt
            meLiked {
                memberId
                likeRefId
                myFavorite
            }
            memberData {
                _id
                memberType
                memberStatus
                memberAuthType
                memberPhone
                memberNick
                memberFullName
                memberImage
                memberAddress
                memberDesc
                memberProperties
                memberArticles
                memberFollowers
                memberFollowings
                memberPoints
                memberLikes
                memberViews
                memberComments
                memberRank
                memberWarnings
                memberBlocks
                deletedAt
                createdAt
                updatedAt
                accessToken
            }
        }
        metaCounter {
            total
        }
    }
}
 

`;

export const GET_FAVORITES = gql`
query GetFavorites($input: OrdinaryInquiry!) {
    getFavorites(input: $input) {
        list {
            _id
            propertyType
            propertyStatus
            propertyCategory
            propertyMaterial
            propertyColor
            propertySize
            propertyTitle
            propertyPrice
            propertySalePrice
            propertyIsOnSale
            propertySaleExpiresAt
            propertyImages
            propertyDesc
            propertyBarter
            propertyRent
            propertyInStock
            propertyCondition
            propertyBrand
            propertyOriginCountry
            propertyAddress
            propertyViews
            propertyLikes
            propertyComments
            propertyRank
            memberId
            soldAt
            deletedAt
            constructedAt
            createdAt
            updatedAt
            memberData {
                _id
                memberType
                memberStatus
                memberAuthType
                memberPhone
                memberNick
                memberFullName
                memberImage
                memberAddress
                memberDesc
                memberProperties
                memberArticles
                memberFollowers
                memberFollowings
                memberPoints
                memberLikes
                memberViews
                memberComments
                memberRank
                memberWarnings
                memberBlocks
                deletedAt
                createdAt
                updatedAt
                accessToken
            }
        }
        metaCounter {
            total
        }
    }
}

`;

export const GET_VISITED = gql`
query GetVisited($input: OrdinaryInquiry!) {
    getVisited(input: $input) {
        list {
            _id
            propertyType
            propertyStatus
            propertyCategory
            propertyMaterial
            propertyColor
            propertySize
            propertyTitle
            propertyPrice
            propertySalePrice
            propertyIsOnSale
            propertySaleExpiresAt
            propertyImages
            propertyDesc
            propertyBarter
            propertyRent
            propertyInStock
            propertyCondition
            propertyBrand
            propertyOriginCountry
            propertyAddress
            propertyViews
            propertyLikes
            propertyComments
            propertyRank
            memberId
            soldAt
            deletedAt
            constructedAt
            createdAt
            updatedAt
            memberData {
                _id
                memberType
                memberStatus
                memberAuthType
                memberPhone
                memberNick
                memberFullName
                memberImage
                memberAddress
                memberDesc
                memberProperties
                memberArticles
                memberFollowers
                memberFollowings
                memberPoints
                memberLikes
                memberViews
                memberComments
                memberRank
                memberWarnings
                memberBlocks
                deletedAt
                createdAt
                updatedAt
                accessToken
            }
        }
        metaCounter {
            total
        }
    }
}

`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const GET_BOARD_ARTICLE = gql`
	query GetBoardArticle($input: String!) {
		getBoardArticle(articleId: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			articleComments
			memberId
			createdAt
			updatedAt
			memberData {
				_id
				memberType
				memberStatus
				memberAuthType
				memberPhone
				memberNick
				memberFullName
				memberImage
				memberAddress
				memberDesc
				memberWarnings
				memberBlocks
				memberProperties
				memberRank
				memberPoints
				memberLikes
				memberViews
				deletedAt
				createdAt
				updatedAt
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_BOARD_ARTICLES = gql`
	query GetBoardArticles($input: BoardArticlesInquiry!) {
		getBoardArticles(input: $input) {
			list {
				_id
				articleCategory
				articleStatus
				articleTitle
				articleContent
				articleImage
				articleViews
				articleLikes
				articleComments
				memberId
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				memberData {
					_id
					memberType
					memberStatus
					memberAuthType
					memberPhone
					memberNick
					memberFullName
					memberImage
					memberAddress
					memberDesc
					memberWarnings
					memberBlocks
					memberProperties
					memberRank
					memberPoints
					memberLikes
					memberViews
					deletedAt
					createdAt
					updatedAt
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const GET_COMMENTS = gql`
	query GetComments($input: CommentsInquiry!) {
		getComments(input: $input) {
			list {
				_id
				commentStatus
				commentGroup
				commentContent
				commentRefId
				memberId
				createdAt
				updatedAt
				memberData {
					_id
					memberType
					memberStatus
					memberAuthType
					memberPhone
					memberNick
					memberFullName
					memberImage
					memberAddress
					memberDesc
					memberWarnings
					memberBlocks
					memberProperties
					memberRank
					memberPoints
					memberLikes
					memberViews
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         FOLLOW        *
 *************************/
export const GET_MEMBER_FOLLOWERS = gql`
query GetMemberFollowers($input: FollowInquiry!) {
    getMemberFollowers(input: $input) {
        list {
            _id
            followingId
            followerId
            createdAt
            updatedAt
            followerData {
                _id
                memberType
                memberStatus
                memberAuthType
                memberPhone
                memberNick
                memberFullName
                memberImage
                memberAddress
                memberDesc
                memberProperties
                memberArticles
                memberFollowers
                memberFollowings
                memberPoints
                memberLikes
                memberViews
                memberComments
                memberRank
                memberWarnings
                memberBlocks
                deletedAt
                createdAt
                updatedAt
                accessToken
            }
            meLiked {
                memberId
                likeRefId
                myFavorite
            }
            meFollowed {
                followingId
                followerId
                myFollowing
            }
        }
        metaCounter {
            total
        }
    }
}
`;

export const GET_MEMBER_FOLLOWINGS = gql`
	query GetMemberFollowings($input: FollowInquiry!) {
		getMemberFollowings(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				updatedAt
				followingData {
					_id
					memberType
					memberStatus
					memberAuthType
					memberPhone
					memberNick
					memberFullName
					memberImage
					memberAddress
					memberDesc
					memberProperties
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
			}
			metaCounter {
				total
			}
		}
	}
`;


/**************************
 *      REPAIRPROPERTY     *
 *************************/

export const GET_REPAIRPROPERTY = gql`
query GetRepairProperty($input: String!) {
    getRepairProperty(repairId: $input) {
        _id
        repairPropertyType
        repairPropertyStatus
        repairPropertyAddress
        repairPropertyDescription
        repairPropertyImages
        repairPropertyViews
        repairPropertyLikes
        repairPropertyComments
        memberId
        deletedAt
        constructedAt
        createdAt
        meLiked {
            memberId
            likeRefId
            myFavorite
        }
        memberData {
            _id
            memberType
            memberStatus
            memberAuthType
            memberPhone
            memberNick
            memberFullName
            memberImage
            memberAddress
            memberDesc
            memberProperties
            memberArticles
            memberFollowers
            memberFollowings
            memberPoints
            memberLikes
            memberViews
            memberComments
            memberRank
            memberWarnings
            memberBlocks
            deletedAt
            createdAt
            updatedAt
            accessToken
        }
    }
}


`;

export const GET_REPAIRPROPERTIES = gql`
query GetRepairProperties($input: RepairPropertiesInquiry!) {
    getRepairProperties(input: $input) {
        list {
            _id
            repairPropertyType
            repairPropertyStatus
            repairPropertyAddress
            repairPropertyDescription
            repairPropertyImages
            repairPropertyViews
            repairPropertyLikes
            repairPropertyComments
            memberId
            deletedAt
            constructedAt
            createdAt
            meLiked {
                memberId
                likeRefId
                myFavorite
            }
            memberData {
                _id
                memberType
                memberStatus
                memberAuthType
                memberPhone
                memberNick
                memberFullName
                memberImage
                memberAddress
                memberDesc
                memberProperties
                memberArticles
                memberFollowers
                memberFollowings
                memberPoints
                memberLikes
                memberViews
                memberComments
                memberRank
                memberWarnings
                memberBlocks
                deletedAt
                createdAt
                updatedAt
                accessToken
            }
        }
        metaCounter {
            total
        }
    }
}


`;

export const GET_TECHNICIANPROPERTY = gql`
query GetTechnicianProperties($input: TechnicianPropertiesInquiry!) {
    getTechnicianProperties(input: $input) {
        list {
            _id
            repairPropertyType
            repairPropertyStatus
            repairPropertyAddress
            repairPropertyDescription
            repairPropertyImages
            repairPropertyViews
            repairPropertyLikes
            repairPropertyComments
            memberId
            deletedAt
            constructedAt
            createdAt
            meLiked {
                memberId
                likeRefId
                myFavorite
            }
            memberData {
                _id
                memberType
                memberStatus
                memberAuthType
                memberPhone
                memberNick
                memberFullName
                memberImage
                memberAddress
                memberDesc
                memberProperties
                memberArticles
                memberFollowers
                memberFollowings
                memberPoints
                memberLikes
                memberViews
                memberComments
                memberRank
                memberWarnings
                memberBlocks
                deletedAt
                createdAt
                updatedAt
                accessToken
            }
        }
        metaCounter {
            total
        }
    }
}


`;

export const GET_REPAIRFAVORITES = gql`
query GetRepairFavorites($input: RepairOrdinaryInquiry!) {
    getRepairFavorites(input: $input) {
        list {
            _id
            repairPropertyType
            repairPropertyStatus
            repairPropertyAddress
            repairPropertyDescription
            repairPropertyImages
            repairPropertyViews
            repairPropertyLikes
            repairPropertyComments
            memberId
            deletedAt
            constructedAt
            createdAt
            meLiked {
                memberId
                likeRefId
                myFavorite
            }
            memberData {
                _id
                memberType
                memberStatus
                memberAuthType
                memberPhone
                memberNick
                memberFullName
                memberImage
                memberAddress
                memberDesc
                memberProperties
                memberArticles
                memberFollowers
                memberFollowings
                memberPoints
                memberLikes
                memberViews
                memberComments
                memberRank
                memberWarnings
                memberBlocks
                deletedAt
                createdAt
                updatedAt
                accessToken
            }
        }
        metaCounter {
            total
        }
    }
}


`;

export const GET_REPAIRVISITED = gql`
query GetRepairVisited($input: RepairOrdinaryInquiry!) {
    getRepairVisited(input: $input) {
        list {
            _id
            repairPropertyType
            repairPropertyStatus
            repairPropertyAddress
            repairPropertyDescription
            repairPropertyImages
            repairPropertyViews
            repairPropertyLikes
            repairPropertyComments
            memberId
            deletedAt
            constructedAt
            createdAt
            meLiked {
                memberId
                likeRefId
                myFavorite
            }
            memberData {
                _id
                memberType
                memberStatus
                memberAuthType
                memberPhone
                memberNick
                memberFullName
                memberImage
                memberAddress
                memberDesc
                memberProperties
                memberArticles
                memberFollowers
                memberFollowings
                memberPoints
                memberLikes
                memberViews
                memberComments
                memberRank
                memberWarnings
                memberBlocks
                deletedAt
                createdAt
                updatedAt
                accessToken
            }
        }
        metaCounter {
            total
        }
    }
}
`;

/**************************
 *         NOTICE        *
 *************************/

export const GET_ALL_NOTICES = gql`
  query GetAllNotices($input: AllNoticesInquiry!) {
    getAllNotices(input: $input) {
      list {
        _id
        noticeCategory
        noticeStatus
        noticeTitle
        noticeContent
        memberId
        createdAt
        updatedAt
      }
      metaCounter {
        _id
        count
      }
    }
  }
`;

export const GET_NOTICE = gql`
  query GetNotice($noticeId: String!) {
    getNotice(noticeId: $noticeId) {
      _id
      noticeCategory
      noticeStatus
      noticeTitle
      noticeContent
      memberId
      createdAt
      updatedAt
    }
  }
`;