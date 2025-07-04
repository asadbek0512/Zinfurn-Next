import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const SIGN_UP = gql`
mutation Signup($input: MemberInput!) {
    signup(input: $input) {
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
        memberEmail
    }
}



`;

export const LOGIN = gql`
mutation Login($input: LoginInput!) {
    login(input: $input){
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
        memberEmail

    }
}

`;

export const UPDATE_MEMBER = gql`
mutation UpdateMember($input: MemberUpdate!) {
    updateMember(input: $input) {
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
        memberEmail
    }
}

`;

export const LIKE_TARGET_MEMBER = gql`
mutation LikeTargetMember($input: String!) {
    likeTargetMember(memberId: $input) {
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

`;

/**************************
 *        PROPERTY        *
 *************************/

export const CREATE_PROPERTY = gql`
mutation CreateProperty($input: PropertyInput!) {
    createProperty(input: $input) {
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
    }
}
`;

export const UPDATE_PROPERTY = gql`
mutation UpdateProperty($input: PropertyUpdate!) {
    updateProperty(input: $input) {
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
    }
}

`;

export const LIKE_TARGET_PROPERTY = gql`
mutation LikeTargetProperty($input: String!) {
    likeTargetProperty(propertyId: $input) {
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
    }
}

`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const CREATE_BOARD_ARTICLE = gql`
	mutation CreateBoardArticle($input: BoardArticleInput!) {
		createBoardArticle(input: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_BOARD_ARTICLE = gql`
	mutation UpdateBoardArticle($input: BoardArticleUpdate!) {
		updateBoardArticle(input: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const LIKE_TARGET_BOARD_ARTICLE = gql`
	mutation LikeTargetBoardArticle($input: String!) {
		likeTargetBoardArticle(articleId: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const CREATE_COMMENT = gql`
	mutation CreateComment($input: CommentInput!) {
		createComment(input: $input) {
			_id
			commentStatus
			commentGroup
			commentContent
			commentRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_COMMENT = gql`
	mutation UpdateComment($input: CommentUpdate!) {
		updateComment(input: $input) {
			_id
			commentStatus
			commentGroup
			commentContent
			commentRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         FOLLOW        *
 *************************/

export const SUBSCRIBE = gql`
	mutation Subscribe($input: String!) {
		subscribe(input: $input) {
			_id
			followingId
			followerId
			createdAt
			updatedAt
		}
	}
`;

export const UNSUBSCRIBE = gql`
	mutation Unsubscribe($input: String!) {
		unsubscribe(input: $input) {
			_id
			followingId
			followerId
			createdAt
			updatedAt
		}
	}
`;


/**************************
 *      REPAIRPROPERTY     *
 *************************/

export const CREATE_REPAIRPROPERTY = gql`
mutation CreateRepairProperty($input: RepairPropertyInput!) {
    createRepairProperty(input: $input) {
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
    }
}

`;


export const LIKE_TARGET_REPAIRPROPERTY = gql`
mutation LikeTargetRepairProperty($input: String!) {
    likeTargetRepairProperty(repairId: $input) {
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
    }
}
`;



export const GET_TECHNICIAN_PROPERTIES = gql`
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