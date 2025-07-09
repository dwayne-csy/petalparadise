const homeController = (req, res) => {
    res.status(200).json({
        message: "Welcome to Petal Paradise",
        status: "success",
        timestamp: new Date().toISOString()
    });
};

module.exports = homeController;