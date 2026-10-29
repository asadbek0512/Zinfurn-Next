import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const GET_MY_PROFILE = gql`
    query GetMyProfile {
        getMyProfile {
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
            memberProducts
            memberArticles
            memberFollowers
            memberFollowings
            memberPoints
            memberLikes
            memberViews
            memberRank
            memberWarnings
            memberBlocks
            memberEmail
            memberTelegramId
            memberGoogleId
        }
    }
`;

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
            memberProducts
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
            memberProducts
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
        memberProducts
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
 *        PRODUCT        *
 *************************/

export const GET_PRODUCT = gql`
query GetProduct($input: String!) {
    getProduct(productId: $input) {
        _id
        productType
        productStatus
        productCategory
        productMaterial
        productColor
        productSize
        productTitle
        productPrice
        productSalePrice
        productIsOnSale
        productStock
        productSaleStartsAt
        productSaleExpiresAt
        productImages
        productArModel
        productDesc
        productTranslations {
          uz { title desc }
          en { title desc }
          ru { title desc }
          kr { title desc }
          ar { title desc }
        }
        productBarter
        productRent
        productInStock
        productCondition
        productBrand
        productOriginCountry
        productAddress
        productViews
        productLikes
        productReviews
        productRating
        productSoldCount
        productRank
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
            memberProducts
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

/** Only the fields the AR picker needs — every product that has a GLB attached */
export const GET_AR_PRODUCTS = gql`
query GetArProducts($input: ProductsInquiry!) {
    getProducts(input: $input) {
        list {
            _id
            productTitle
            productArModel
            productImages
        }
    }
}
`;

export const GET_PRODUCTS = gql`
query GetProducts($input: ProductsInquiry!) {
    getProducts(input: $input) {
        list {
            _id
            productType
            productStatus
            productCategory
            productMaterial
            productColor
            productSize
            productTitle
            productPrice
            productSalePrice
            productIsOnSale
            productStock
            productSaleStartsAt
            productSaleExpiresAt
            productImages
            productDesc
            productTranslations {
              uz { title desc }
              en { title desc }
              ru { title desc }
              kr { title desc }
              ar { title desc }
            }
            productBarter
            productRent
            productInStock
            productCondition
            productBrand
            productOriginCountry
            productAddress
            productViews
            productLikes
            productReviews
            productRating
            productSoldCount
            productRank
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
                memberProducts
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

export const GET_AGENT_PRODUCTS = gql`
query GetAgentProducts($input: AgentProductsInquiry!) {
    getAgentProducts(input: $input) {
        list {
            _id
            productType
            productStatus
            productCategory
            productMaterial
            productColor
            productSize
            productTitle
            productPrice
            productSalePrice
            productIsOnSale
            productStock
            productSaleStartsAt
            productSaleExpiresAt
            productImages
            productDesc
            productTranslations {
              uz { title desc }
              en { title desc }
              ru { title desc }
              kr { title desc }
              ar { title desc }
            }
            productBarter
            productRent
            productInStock
            productCondition
            productBrand
            productOriginCountry
            productAddress
            productViews
            productLikes
            productReviews
            productRating
            productSoldCount
            productRank
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
                memberProducts
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
            productType
            productStatus
            productCategory
            productMaterial
            productColor
            productSize
            productTitle
            productPrice
            productSalePrice
            productIsOnSale
            productStock
            productSaleStartsAt
            productSaleExpiresAt
            productImages
            productDesc
            productTranslations {
              uz { title desc }
              en { title desc }
              ru { title desc }
              kr { title desc }
              ar { title desc }
            }
            productBarter
            productRent
            productInStock
            productCondition
            productBrand
            productOriginCountry
            productAddress
            productViews
            productLikes
            productReviews
            productRating
            productSoldCount
            productRank
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
                memberProducts
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
            productType
            productStatus
            productCategory
            productMaterial
            productColor
            productSize
            productTitle
            productPrice
            productSalePrice
            productIsOnSale
            productStock
            productSaleStartsAt
            productSaleExpiresAt
            productImages
            productDesc
            productTranslations {
              uz { title desc }
              en { title desc }
              ru { title desc }
              kr { title desc }
              ar { title desc }
            }
            productBarter
            productRent
            productInStock
            productCondition
            productBrand
            productOriginCountry
            productAddress
            productViews
            productLikes
            productReviews
            productRating
            productSoldCount
            productRank
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
                memberProducts
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
			articleTranslations {
				uz { title desc }
				en { title desc }
				ru { title desc }
				kr { title desc }
				ar { title desc }
			}
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
				memberProducts
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
				articleTranslations {
					uz { title desc }
					en { title desc }
					ru { title desc }
					kr { title desc }
					ar { title desc }
				}
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
					memberProducts
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
				commentReplyId
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
					memberProducts
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
                memberProducts
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
					memberProducts
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
 *      REPAIRPRODUCT     *
 *************************/

export const GET_REPAIRPRODUCT = gql`
query GetRepairProduct($input: String!) {
    getRepairProduct(repairId: $input) {
        _id
        repairProductType
        repairProductStatus
        repairProductAddress
        repairProductDescription
        repairProductTranslations {
        	uz { title desc }
        	en { title desc }
        	ru { title desc }
        	kr { title desc }
        	ar { title desc }
        }
        repairProductImages
        repairProductViews
        repairProductLikes
        repairProductComments
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
            memberProducts
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

export const GET_REPAIRPRODUCTS = gql`
query GetRepairProducts($input: RepairProductsInquiry!) {
    getRepairProducts(input: $input) {
        list {
            _id
            repairProductType
            repairProductStatus
            repairProductAddress
            repairProductDescription
            repairProductTranslations {
            	uz { title desc }
            	en { title desc }
            	ru { title desc }
            	kr { title desc }
            	ar { title desc }
            }
            repairProductImages
            repairProductViews
            repairProductLikes
            repairProductComments
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
                memberProducts
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

export const GET_TECHNICIANPRODUCT = gql`
query GetTechnicianProducts($input: TechnicianProductsInquiry!) {
    getTechnicianProducts(input: $input) {
        list {
            _id
            repairProductType
            repairProductStatus
            repairProductAddress
            repairProductDescription
            repairProductTranslations {
            	uz { title desc }
            	en { title desc }
            	ru { title desc }
            	kr { title desc }
            	ar { title desc }
            }
            repairProductImages
            repairProductViews
            repairProductLikes
            repairProductComments
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
                memberProducts
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
            repairProductType
            repairProductStatus
            repairProductAddress
            repairProductDescription
            repairProductTranslations {
            	uz { title desc }
            	en { title desc }
            	ru { title desc }
            	kr { title desc }
            	ar { title desc }
            }
            repairProductImages
            repairProductViews
            repairProductLikes
            repairProductComments
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
                memberProducts
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
            repairProductType
            repairProductStatus
            repairProductAddress
            repairProductDescription
            repairProductTranslations {
            	uz { title desc }
            	en { title desc }
            	ru { title desc }
            	kr { title desc }
            	ar { title desc }
            }
            repairProductImages
            repairProductViews
            repairProductLikes
            repairProductComments
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
                memberProducts
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
 *          ORDER         *
 *************************/

export const GET_MY_ORDERS = gql`
	query GetMyOrders($input: OrdersInquiry!) {
		getMyOrders(input: $input) {
			list {
				_id
				orderId
				memberId
				orderItems {
					productId
					productTitle
					productImage
					productPrice
					quantity
				}
				orderStatus
				orderTotal
				orderDiscount
				deliveryFee
				deliveryInfo {
					fullName
					address
					city
					phone
					note
				}
				confirmedAt
				cancelledAt
				returnRequestedAt
				returnReason
				returnedAt
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ORDER_BY_ID = gql`
	query GetOrderById($orderId: String!) {
		getOrderById(orderId: $orderId) {
			_id
			orderId
			memberId
			orderItems {
				productId
				productTitle
				productImage
				productPrice
				quantity
			}
			orderStatus
			orderTotal
			orderDiscount
			deliveryFee
			deliveryInfo {
				fullName
				address
				city
				phone
				note
			}
			confirmedAt
			cancelledAt
			returnRequestedAt
			returnReason
			returnedAt
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         REVIEW         *
 *************************/

export const GET_PRODUCT_REVIEWS = gql`
	query GetProductReviews($input: ReviewsInquiry!) {
		getProductReviews(input: $input) {
			list {
				_id
				memberId
				productId
				orderId
				reviewRating
				reviewContent
				reviewImages
				reviewStatus
				createdAt
				updatedAt
				likesCount
				dislikesCount
				myReaction
				memberData {
					_id
					memberNick
					memberImage
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_PRODUCT_REVIEW_SUMMARY = gql`
	query GetProductReviewSummary($productId: String!) {
		getProductReviewSummary(productId: $productId) {
			averageRating
			totalReviews
			ratingDistribution {
				star
				count
			}
		}
	}
`;

export const GET_MY_CONVERSATIONS = gql`
	query GetMyConversations {
		getMyConversations {
			conversationId
			productId
			kind
			productTitle
			productImage
			lastMessage
			lastMessageAt
			unreadCount
			partner {
				_id
				memberNick
				memberImage
			}
		}
	}
`;

export const GET_CONVERSATION = gql`
	query GetConversation($conversationId: String!) {
		getConversation(conversationId: $conversationId) {
			_id
			conversationId
			senderId
			receiverId
			message
			messageStatus
			createdAt
			senderData {
				_id
				memberNick
				memberImage
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
        noticeTranslations {
        	uz { title desc }
        	en { title desc }
        	ru { title desc }
        	kr { title desc }
        	ar { title desc }
        }
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
      noticeTranslations {
      	uz { title desc }
      	en { title desc }
      	ru { title desc }
      	kr { title desc }
      	ar { title desc }
      }
      memberId
      createdAt
      updatedAt
    }
  }
`;
export const VALIDATE_COUPON = gql`
	query ValidateCoupon($couponCode: String!, $orderTotal: Float!) {
		validateCoupon(couponCode: $couponCode, orderTotal: $orderTotal) {
			valid
			message
			discountAmount
			finalTotal
			couponCode
		}
	}
`;

/** Faqat id'lar — widget sevimlilari uchun */
export const GET_FAVORITE_IDS = gql`
	query GetFavoriteIds($input: OrdinaryInquiry!) {
		getFavorites(input: $input) {
			list {
				_id
			}
		}
	}
`;

/**         SELLER DASHBOARD        */

export const GET_SELLER_DASHBOARD = gql`
	query GetSellerDashboard {
		getSellerDashboard {
			totalRevenue
			totalOrders
			itemsSold
			activeListings
			soldListings
			totalListings
			totalViews
			totalLikes
			topProducts {
				productId
				productTitle
				productImage
				soldQty
				revenue
			}
			salesTrend {
				date
				revenue
				orders
			}
		}
	}
`;
