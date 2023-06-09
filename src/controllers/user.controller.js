const User = require("../schema/user.schema");
const Post = require("../schema/post.schema")

module.exports.getUsersWithPostCount = async (req, res) => {
  try {
    //TODO: Implement this API
    const page = (req.query.page * 1) || 1 
    console.log(page)
    const limit = (req.query.limit *1) || 10
    const skip = (req.query.page -1) * limit || 0
    const result = await User.aggregate([
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'userId',
          as: 'posts',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          posts: { $size: '$posts' },
        },
      },
      {
        $facet: {
          users: [
            { $sort: { name: 1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
          ],
          totalCount: [
            { $count: 'count' },
          ],
        },
      },
    ]);
    
    const users = result[0].users;
    const totalCount = result[0].totalCount[0].count;
    const totalPages = Math.ceil(totalCount / limit);   

   
    
    res.status(200).json({data: {
      users,
      pagination: {
        totalDocs: totalCount,
        limit,
        page,
        totalPages,
        pagingCounter: (page - 1) * limit + 1,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < totalPages ? page + 1 : null,
      },
    }});
  
  } catch (error) {
    res.send({ error});
  }
};
