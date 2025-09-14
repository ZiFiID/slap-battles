export default function handler(req, res) {
  const userAgent = req.headers['user-agent'] || '';
  const isRobloxOrDelta = userAgent.includes('Roblox') || !userAgent.includes('Mozilla'); // Fallback untuk Delta

  if (isRobloxOrDelta) {
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(`if game.PlaceId ~= 6403373529 then
    return
end

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")
local UserInputService = game:GetService("UserInputService")
local Players = game:GetService("Players")
local StarterGui = game:GetService("StarterGui")
local LocalPlayer = Players.LocalPlayer

local function notify(title, text, duration)
    pcall(function()
        StarterGui:SetCore("SendNotification", {
            Title = title,
            Text = text,
            Duration = duration or 3
        })
    end)
end

local function checkRemote(path, name)
    local ok, result = pcall(function()
        return path and path:IsA("RemoteEvent")
    end)
    if not ok or not result then
        notify("Patched!", "Remote '" .. name .. "' not found!", 5)
        return nil
    end
    return path
end

local paintRemote = ReplicatedStorage:FindFirstChild("Events") and ReplicatedStorage.Events:FindFirstChild("paint")
local generalRemote = ReplicatedStorage:FindFirstChild("GeneralAbility")

paintRemote = checkRemote(paintRemote, "paint")
generalRemote = checkRemote(generalRemote, "GeneralAbility")

if not paintRemote and not generalRemote then
    notify("Patched!", "All remotes are missing!", 5)
    return
end

local screenGui = Instance.new("ScreenGui")
screenGui.Name = "MinimalToggleGui"
screenGui.Parent = LocalPlayer:WaitForChild("PlayerGui")
screenGui.ResetOnSpawn = false

local mainFrame = Instance.new("Frame")
mainFrame.Size = UDim2.new(0, 110, 0, 50)
mainFrame.Position = UDim2.new(1, -130, 0, 20)
mainFrame.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
mainFrame.BackgroundTransparency = 0.2
mainFrame.Active = true
mainFrame.Parent = screenGui

Instance.new("UICorner", mainFrame).CornerRadius = UDim.new(0, 10)

local stroke = Instance.new("UIStroke", mainFrame)
stroke.Color = Color3.fromRGB(255, 255, 255)
stroke.Thickness = 1
stroke.Transparency = 0.8

local layout = Instance.new("UIListLayout", mainFrame)
layout.Padding = UDim.new(0, 4)
layout.FillDirection = Enum.FillDirection.Vertical
layout.HorizontalAlignment = Enum.HorizontalAlignment.Center
layout.VerticalAlignment = Enum.VerticalAlignment.Center

local padding = Instance.new("UIPadding", mainFrame)
padding.PaddingTop = UDim.new(0, 6)
padding.PaddingBottom = UDim.new(0, 6)

layout:GetPropertyChangedSignal("AbsoluteContentSize"):Connect(function()
    TweenService:Create(mainFrame, TweenInfo.new(0.25), {
        Size = UDim2.new(0, 110, 0, layout.AbsoluteContentSize.Y + padding.PaddingTop.Offset + padding.PaddingBottom.Offset)
    }):Play()
end)

local function createToggle(remote, labelText)
    local btn = Instance.new("TextButton")
    btn.Size = UDim2.new(0, 90, 0, 28)
    btn.BackgroundColor3 = Color3.fromRGB(60, 60, 60)
    btn.Text = labelText .. " OFF"
    btn.TextColor3 = Color3.fromRGB(255, 255, 255)
    btn.Font = Enum.Font.SourceSansSemibold
    btn.TextSize = 13
    btn.Parent = mainFrame

    Instance.new("UICorner", btn).CornerRadius = UDim.new(0, 6)

    local toggled = false
    local loopThread

    local function update(state)
        toggled = state
        local color = state and Color3.fromRGB(0, 170, 80) or Color3.fromRGB(170, 50, 50)
        TweenService:Create(btn, TweenInfo.new(0.2), { BackgroundColor3 = color }):Play()
        btn.Text = labelText .. (state and " ON" or " OFF")
    end

    btn.MouseButton1Click:Connect(function()
        update(not toggled)

        if toggled then
            loopThread = task.spawn(function()
                while toggled do
                    local ok = pcall(function()
                        remote:FireServer()
                    end)
                    if not ok then
                        notify("Patched!", "Remote '" .. labelText .. "' blocked!", 5)
                        update(false)
                        break
                    end
                    task.wait(0.05)
                end
            end)
        else
            if loopThread then
                task.cancel(loopThread)
            end
        end
    end)

    update(false)
end

if paintRemote then createToggle(paintRemote, "Paint") end
if generalRemote then createToggle(generalRemote, "General") end

local function createPaintGlovesButton()
    local btn = Instance.new("TextButton")
    btn.Size = UDim2.new(0, 90, 0, 28)
    btn.BackgroundColor3 = Color3.fromRGB(70, 70, 70)
    btn.Text = "Paint Gloves"
    btn.TextColor3 = Color3.fromRGB(255, 255, 255)
    btn.Font = Enum.Font.SourceSansSemibold
    btn.TextSize = 13
    btn.Parent = mainFrame

    Instance.new("UICorner", btn).CornerRadius = UDim.new(0, 6)

    btn.MouseButton1Click:Connect(function()
        local itemName = "Paint"
        local remoteCount = 0

        for _, v in ipairs(ReplicatedStorage:GetDescendants()) do
            if v:IsA("RemoteEvent") and string.match(v.Name, "{") then
                local success = pcall(function()
                    v:FireServer(itemName)
                end)
                if success then
                    remoteCount = remoteCount + 1
                end
            end
        end

        if remoteCount > 0 then
            notify("Item Added", itemName .. " Has Been Added!", 3)
        else
            notify("Patched!", "No RemoteEvent found!", 3)
        end
    end)
end

createPaintGlovesButton()

local dragging, dragStart, startPos
local function startDrag(input)
    dragging = true
    dragStart = input.Position
    startPos = mainFrame.Position
end
local function updateDrag(input)
    if dragging then
        local delta = input.Position - dragStart
        mainFrame.Position = UDim2.new(
            startPos.X.Scale, startPos.X.Offset + delta.X,
            startPos.Y.Scale, startPos.Y.Offset + delta.Y
        )
    end
end

mainFrame.InputBegan:Connect(function(input)
    if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
        startDrag(input)
    end
end)
UserInputService.InputChanged:Connect(function(input)
    if input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch then
        updateDrag(input)
    end
end)
UserInputService.InputEnded:Connect(function(input)
    if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
        dragging = false
    end
end)

notify("GUI Loaded", "Minimal Toggle GUI is active!", 3)`);
  } else {
    res.status(403).setHeader('Content-Type', 'text/plain').send('Contents cannot be displayed in browser');
  }
}
