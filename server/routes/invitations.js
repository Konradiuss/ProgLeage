const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Invitation = require('../models/Invitation');
const Project = require('../models/Project');
const User = require('../models/User');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const invitations = await Invitation.find({ recipient: userId })
      .populate('project', 'title')
      .populate('sender', 'firstName lastName');

    res.json(invitations);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:invitationId/accept', authMiddleware, async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userId = req.user._id;

    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (!invitation.recipient.equals(userId)) {
      return res.status(403).json({ error: 'You are not authorized to accept this invitation' });
    }

    await Project.findByIdAndUpdate(invitation.project, {
      $addToSet: { participants: userId },
    });

    await User.findByIdAndUpdate(userId, {
      $addToSet: { participatingProjects: invitation.project },
    });

    await Invitation.findByIdAndDelete(invitationId);

    res.json({ message: 'Invitation accepted successfully' });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:invitationId', authMiddleware, async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userId = req.user._id;

    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (!invitation.recipient.equals(userId)) {
      return res.status(403).json({ error: 'You are not authorized to decline this invitation' });
    }

    await Invitation.findByIdAndDelete(invitationId);

    res.json({ message: 'Invitation declined successfully' });
  } catch (error) {
    console.error('Error declining invitation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;