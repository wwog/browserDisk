export async function sendMessageToContent<R>(
  payload: Record<string, any>
): Promise<R> {
  try {
    const { error, result } = await chrome.tabs.sendMessage(
      chrome.devtools.inspectedWindow.tabId,
      payload
    );
    if (error) {
      throw new Error(error);
    }
    return result;
  } catch (error) {
    console.error('Error sending message to content script:', error);
    throw error;
  }
}
